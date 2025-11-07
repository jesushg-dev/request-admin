import { edgeLabels } from '@/constants/execution-flow';
import { ExecutionFlowValues } from '@/services/schemas/execution-flow';
import { atom } from 'jotai';
import { atomWithReducer } from 'jotai/utils';
import { Locale } from 'next-intl';

import { ExecutionHistoryActions } from '@/types/execution-flow';
import type { AvailableNode, ExecutionHistoryEntry, FlowEdge, FlowNode, ParallelGroups, PendingDecision, ProcessFlow } from '@/types/execution-flow';
import type { ExecutionLogType } from '@/types/zenstackhq/request';
import { calculateLevelsAndAvailableNodes } from '@/lib/execution-flow';

export enum ERROR_TYPES {
  NO_PROCESS_FLOW = 'NO_PROCESS_FLOW',
  INVALID_PROCESS_FLOW = 'INVALID_PROCESS_FLOW',
}

export interface ExecutionState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  processFlow: ProcessFlow | null;
  currentNodeId: string | null;
  completedNodeIds: string[];
  availableNodes: AvailableNode[];
  progress: number;
  currentLevel: number;
  totalLevels: number;
  error: ERROR_TYPES | null;
  isComplete: boolean;
  pendingDecision: PendingDecision | null;
  selectedNode: FlowNode | null;
  parallelGroups: ParallelGroups;
  executionHistory: ExecutionHistoryEntry[];
}

export const initialState: ExecutionState = {
  nodes: [],
  edges: [],
  processFlow: null,
  currentNodeId: null,
  completedNodeIds: [],
  availableNodes: [],
  progress: 0,
  currentLevel: 1,
  totalLevels: 1,
  error: null,
  isComplete: false,
  pendingDecision: null,
  selectedNode: null,
  parallelGroups: {},
  executionHistory: [],
};

// Helper functions
const updateNodeStylesHelper = (nodeList: FlowNode[], currentId: string | null, completedIds: string[]): FlowNode[] => {
  return nodeList.map((node) => {
    const isExecuting = node.id === currentId;
    const isCompleted = completedIds.includes(node.id);
    const boxShadow = isExecuting ? '0 0 0 2px #3b82f6' : isCompleted ? '0 0 0 2px #22c55e' : undefined;
    return { ...node, style: { ...node.style, boxShadow }, data: { ...node.data, isExecuting, isCompleted } } as FlowNode;
  });
};

const calculateNextNodeHelper = (edges: FlowEdge[], nodeId: string): string | null => {
  const relevantEdges = edges.filter((edge) => edge.source === nodeId);
  return relevantEdges[0]?.target || null;
};

// State management
type StateAction = {
  type: 'SET_STATE';
  payload: Partial<ExecutionState>;
};

export const stateAtom = atomWithReducer<ExecutionState, StateAction>(initialState, (prev, action) => {
  if (!action) return prev;
  return action.type === 'SET_STATE' ? { ...prev, ...action.payload } : prev;
});

// Action atoms
export const setPendingDecisionAtom = atom(null, (_, set, decision: PendingDecision | null) => {
  set(stateAtom, { type: 'SET_STATE', payload: { pendingDecision: decision } });
});

export const setParallelGroupsAtom = atom(null, (_, set, groups: ParallelGroups) => {
  set(stateAtom, { type: 'SET_STATE', payload: { parallelGroups: groups } });
});

export const initializeProcessFlowAtom = atom(
  null,
  (
    get,
    set,
    [
      flow,
      locale,
      executionLogs,
    ]: [
      ExecutionFlowValues | undefined,
      Locale | undefined,
      ExecutionLogType[] | undefined,
    ]
  ) => {
    const state = get(stateAtom);

    if (!flow) {
      set(stateAtom, { type: 'SET_STATE', payload: { error: ERROR_TYPES.NO_PROCESS_FLOW } });
      return;
    }

    try {
      const flowNodes = flow.nodes.map((node) => ({
        ...node,
        data: { ...node.data, isExecuting: false, isCompleted: false },
      })) as FlowNode[];

      const flowEdges = flow.edges.map((edge) => ({
        ...edge,
        markerEnd: { type: 'arrowclosed', width: 20, height: 20 },
        label: edge.sourceHandle ? edgeLabels[locale || 'es'][edge.sourceHandle] : 'N/A',
        labelStyle: { fill: '#888', fontWeight: 500 },
        labelBgStyle: { fill: 'rgba(255, 255, 255, 0.8)' },
      })) as FlowEdge[];

      const start = flowNodes.find((n) => n.type === 'start');
      let completedNodeIds: string[] = [];
      let currentNodeId: string | null = start?.id || null;
      let executionHistory: ExecutionHistoryEntry[] = [];

      // Restore state from execution logs if they exist
      if (executionLogs && executionLogs.length > 0) {
        // Process logs in chronological order
        for (const log of executionLogs) {
          let parsedDetails: Record<string, unknown> | string = '';
          try {
            // Details are double-stringified in createExecutionLog
            const firstParse = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
            parsedDetails = typeof firstParse === 'string' ? JSON.parse(firstParse) : firstParse;
          } catch {
            // If parsing fails, use empty object
            parsedDetails = {};
          }

          // Add to execution history
          executionHistory.push({
            timestamp: typeof log.timestamp === 'string' ? new Date(log.timestamp) : log.timestamp,
            nodeId: log.nodeId,
            action: ExecutionHistoryActions.COMPLETE,
            details: typeof parsedDetails === 'string' ? parsedDetails : JSON.stringify(parsedDetails),
          });

          // If the log has a successful outcome, mark the node as completed
          if (log.outcome === 'success') {
            // For decision nodes (approval, condition), the details contain the outcome/next node
            if (log.eventType === 'approval' || log.eventType === 'condition') {
              const outcome = typeof parsedDetails === 'object' && parsedDetails !== null ? (parsedDetails as Record<string, unknown>).outcome : null;

              if (outcome && typeof outcome === 'string' && !completedNodeIds.includes(log.nodeId)) {
                completedNodeIds.push(log.nodeId);
                // The outcome is the next node ID for decision nodes
                currentNodeId = outcome;
              } else if (!completedNodeIds.includes(log.nodeId)) {
                // Mark as completed even if we can't parse the outcome
                completedNodeIds.push(log.nodeId);
              }
            } else {
              // For other node types, just mark as completed
              if (!completedNodeIds.includes(log.nodeId)) {
                completedNodeIds.push(log.nodeId);
              }

              // Determine next node based on edges
              if (log.nodeId === currentNodeId) {
                const nextNodeId = calculateNextNodeHelper(flowEdges, log.nodeId);
                currentNodeId = nextNodeId;
              }
            }
          }
        }

        // If we have completed nodes but no current node, check if execution is complete
        if (completedNodeIds.length > 0 && !currentNodeId) {
          // Check if all nodes except start/end are completed
          const nonStartEndNodes = flowNodes.filter((n) => n.type !== 'start' && n.type !== 'end');
          if (nonStartEndNodes.every((n) => completedNodeIds.includes(n.id))) {
            // All nodes are completed, execution is done
            currentNodeId = null;
          } else {
            // Find the next available node from the last completed node
            const lastCompletedNode = completedNodeIds[completedNodeIds.length - 1];
            const nextNodeId = calculateNextNodeHelper(flowEdges, lastCompletedNode);
            currentNodeId = nextNodeId;
          }
        }
      }

      let newState: ExecutionState = {
        ...state,
        processFlow: flow as ProcessFlow,
        nodes: flowNodes,
        edges: flowEdges,
        error: null,
        progress: completedNodeIds.length > 0 ? Math.round((completedNodeIds.length / (flow.nodes.length - 1)) * 100) : 0,
        completedNodeIds,
        isComplete: currentNodeId === null && completedNodeIds.length > 0,
        currentNodeId,
        executionHistory,
      };

      if (start) {
        const initialNodeId = currentNodeId || start.id;
        newState = {
          ...newState,
          currentNodeId: initialNodeId,
          nodes: updateNodeStylesHelper(flowNodes, initialNodeId, completedNodeIds),
          currentLevel: 1,
          totalLevels: 1,
        };

        const { levels, availableNodes } = calculateLevelsAndAvailableNodes(newState.nodes, newState.edges, initialNodeId, completedNodeIds);

        newState.totalLevels = levels;
        newState.availableNodes = availableNodes;
      }

      set(stateAtom, { type: 'SET_STATE', payload: newState });
    } catch {
      set(stateAtom, { type: 'SET_STATE', payload: { error: ERROR_TYPES.INVALID_PROCESS_FLOW } });
    }
  }
);

export const addExecutionHistoryAtom = atom(null, (get, set, [nodeId, action, details]: [string, ExecutionHistoryActions, string?]) => {
  const state = get(stateAtom);
  const newHistory = [
    ...state.executionHistory,
    {
      timestamp: new Date(),
      nodeId,
      action,
      details: details || '',
    },
  ];
  set(stateAtom, { type: 'SET_STATE', payload: { executionHistory: newHistory } });
});

export const completeSimpleNodeAtom = atom(null, (get, set, currentNodeId: string, outcome?: string) => {
  const state = get(stateAtom);
  const newCompletedIds = [...state.completedNodeIds, currentNodeId];

  set(addExecutionHistoryAtom, [currentNodeId, ExecutionHistoryActions.COMPLETE, outcome ? `Outcome: ${outcome}` : 'Node completed']);
  const nextNodeId = outcome ? outcome : calculateNextNodeHelper(state.edges, currentNodeId);

  if (nextNodeId) {
    const { availableNodes } = calculateLevelsAndAvailableNodes(state.nodes, state.edges, nextNodeId, newCompletedIds);

    set(stateAtom, {
      type: 'SET_STATE',
      payload: {
        pendingDecision: null,
        currentNodeId: nextNodeId,
        availableNodes,
        isComplete: false,
        completedNodeIds: newCompletedIds,
        progress: Math.round(((state.completedNodeIds.length + 1) / (state.processFlow?.nodes.length || 1)) * 100),
        nodes: updateNodeStylesHelper(state.nodes, nextNodeId, newCompletedIds),
      },
    });
  } else {
    set(stateAtom, {
      type: 'SET_STATE',
      payload: {
        pendingDecision: null,
        currentNodeId: null,
        availableNodes: [],
        progress: 100,
        isComplete: true,
        completedNodeIds: newCompletedIds,
        nodes: updateNodeStylesHelper(state.nodes, null, newCompletedIds),
      },
    });
  }
});

export const getTargetNodesByHandlesAtom = atom((get) => (nodeId: string, handles: string[]) => {
  const nodes = get(nodesAtom);
  const edges = get(edgesAtom);
  const result: Record<string, FlowNode | undefined> = {};
  for (const handle of handles) {
    const edge = edges.find((e) => e.source === nodeId && e.sourceHandle === handle);
    result[handle] = edge ? nodes.find((n) => n.id === edge.target) : undefined;
  }
  return result;
});

export const totalTimeAtom = atom((get) => {
  const executionHistory = get(executionHistoryAtom);

  if (!executionHistory.length) return { hours: 0, minutes: 0, seconds: 0 };

  const sorted = [...executionHistory].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const first = sorted[0].timestamp;
  const last = sorted[sorted.length - 1].timestamp;

  const start = typeof first === 'string' ? new Date(first) : first;
  const end = typeof last === 'string' ? new Date(last) : last;

  const diffMs = end.getTime() - start.getTime();

  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  return { hours, minutes, seconds };
});

// Derived atoms
export const nodesAtom = atom((get) => get(stateAtom).nodes);
export const edgesAtom = atom((get) => get(stateAtom).edges);
export const currentLevelAtom = atom((get) => get(stateAtom).currentLevel);
export const totalLevelsAtom = atom((get) => get(stateAtom).totalLevels);
export const availableNodesAtom = atom((get) => get(stateAtom).availableNodes);
export const executionHistoryAtom = atom((get) => get(stateAtom).executionHistory);
export const pendingDecisionAtom = atom((get) => get(stateAtom).pendingDecision);
export const processFlowAtom = atom((get) => get(stateAtom).processFlow);
export const isCompleteAtom = atom((get) => get(stateAtom).isComplete);
export const completedNodeIdsAtom = atom((get) => get(stateAtom).completedNodeIds);
export const currentNodeIdAtom = atom((get) => get(stateAtom).currentNodeId);
