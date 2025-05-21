import { useEffect } from 'react';

import { AvailableNode, FlowEdge, FlowNode, NodeSpecificStates, ProcessFlow } from '@/types/execution-flow';

import { useExecutionContext } from '../execution-context';

export function useExecutionState(timersRef: React.RefObject<Record<string, NodeJS.Timeout>>) {
  const { state, dispatch } = useExecutionContext();
  const { activeTab } = state;

  // Clear all timers when the component unmounts
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    const loadProcessFlow = () => {
      const saved = localStorage.getItem('itil-process-flow');
      if (!saved) {
        dispatch({ type: 'SET_ERROR', payload: 'No process flow available. Please create one in the builder.' });
        return;
      }

      try {
        const flow = JSON.parse(saved) as ProcessFlow;
        dispatch({ type: 'SET_PROCESS_FLOW', payload: flow });

        const flowNodes = flow.nodes.map((node) => ({
          ...node,
          data: { ...node.data, isExecuting: false, isCompleted: false },
        })) as FlowNode[];

        const flowEdges = flow.edges.map((edge) => ({
          ...edge,
          markerEnd: { type: 'arrowclosed', width: 20, height: 20 },
          label: getEdgeLabel(edge.sourceHandle),
          labelStyle: { fill: '#888', fontWeight: 500 },
          labelBgStyle: { fill: 'rgba(255, 255, 255, 0.8)' },
        })) as FlowEdge[];

        dispatch({ type: 'SET_NODES', payload: flowNodes });
        dispatch({ type: 'SET_EDGES', payload: flowEdges });

        const start = flowNodes.find((n) => n.type === 'start');
        if (start) {
          dispatch({ type: 'SET_CURRENT_NODE_ID', payload: start.id });
          updateNodeStyles(flowNodes, start.id, []);

          const { levels, availableNodes } = calculateLevelsAndAvailableNodes(flowNodes, flowEdges, start.id, []);
          dispatch({ type: 'SET_AVAILABLE_NODES', payload: availableNodes });
          dispatch({ type: 'SET_LEVELS', payload: { current: 1, total: levels } });
          initializeNodeSpecificStates(flowNodes);
        }
      } catch {
        dispatch({ type: 'SET_ERROR', payload: 'Error loading process flow. Please validate it in the builder.' });
      }
    };

    loadProcessFlow();
    window.addEventListener('storage', loadProcessFlow);
    window.addEventListener('itil-flow-updated', loadProcessFlow);

    return () => {
      window.removeEventListener('storage', loadProcessFlow);
      window.removeEventListener('itil-flow-updated', loadProcessFlow);
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, [activeTab]);

  const getEdgeLabel = (sourceHandle?: string | null): string => {
    switch (sourceHandle) {
      case 'yes':
        return 'Sí';
      case 'no':
        return 'No';
      case 'approve':
        return 'Aprobado';
      case 'reject':
        return 'Rechazado';
      case 'success':
        return 'Éxito';
      case 'error':
        return 'Error';
      default:
        return sourceHandle || '';
    }
  };

  const initializeNodeSpecificStates = (nodes: FlowNode[]) => {
    const states: NodeSpecificStates = {};
    for (const node of nodes) {
      states[node.id] = {};
      if (node.type === 'timer') states[node.id].timer = { timeLeft: node.data.duration || 0, timerActive: false };
      else if (node.type === 'notification') states[node.id].notification = { status: 'idle' };
      else if (node.type === 'task') states[node.id].task = { status: 'idle' };
      else if (node.type === 'message') states[node.id].message = { shown: false };
      else if (node.type === 'loop') states[node.id].loop = { count: 0 };
    }
    dispatch({ type: 'SET_NODE_SPECIFIC_STATES', payload: states });
  };

  const updateNodeStyles = (nodeList: FlowNode[], currentId: string | null, completedIds: string[]) => {
    const updated = nodeList.map((node) => {
      const isExecuting = node.id === currentId;
      const isCompleted = completedIds.includes(node.id);
      const boxShadow = isExecuting ? '0 0 0 2px #3b82f6' : isCompleted ? '0 0 0 2px #22c55e' : undefined;
      return { ...node, style: { ...node.style, boxShadow }, data: { ...node.data, isExecuting, isCompleted } } as FlowNode;
    });
    dispatch({ type: 'SET_NODES', payload: updated });
  };

  // Calculate levels and availability
  const calculateLevelsAndAvailableNodes = (
    nodes: FlowNode[],
    edges: FlowEdge[],
    currentNodeId: string,
    completedNodeIds: string[],
    branch = 'main',
    level = 1,
    parentId?: string
  ): { levels: number; availableNodes: AvailableNode[] } => {
    // 1) build map of node → [dependencies…]
    const dependencyMap: Record<string, string[]> = {};
    edges.forEach((e) => {
      if (!dependencyMap[e.target]) dependencyMap[e.target] = [];
      dependencyMap[e.target].push(e.source);
    });

    const areDependenciesCompleted = (id: string) => (dependencyMap[id] || []).every((dep) => completedNodeIds.includes(dep));

    const availableNodes: AvailableNode[] = [];
    let maxLevel = level;

    // 2) include the current node if not yet completed
    const current = nodes.find((n) => n.id === currentNodeId);
    if (current && !completedNodeIds.includes(currentNodeId)) {
      availableNodes.push({
        node: current,
        isActive: true,
        isCompleted: false,
        isBlocked: false,
        dependenciesCompleted: true,
        level,
        branch,
        parentId,
      });
    }

    // 3) find all outgoing edges
    const outgoing = edges.filter((e) => e.source === currentNodeId);
    const isDecisionNode = ['condition', 'approval', 'gateway'].includes(current?.type || '');

    // 4) for each outgoing edge…
    outgoing.forEach((edge) => {
      const target = nodes.find((n) => n.id === edge.target);
      if (!target) return;

      const blocked = !areDependenciesCompleted(target.id);
      const done = completedNodeIds.includes(target.id);

      // only append a branch suffix when there are multiple outgoing paths
      const suffix = outgoing.length > 1 ? `-${edge.sourceHandle || 'default'}` : '';
      const nextBranch = `${branch}${suffix}`;

      // enqueue this target
      availableNodes.push({
        node: target,
        isActive: false,
        isCompleted: done,
        isBlocked: blocked,
        dependenciesCompleted: !blocked,
        level: level + 1,
        branch: nextBranch,
        parentId: currentNodeId,
      });

      // decide whether to recurse:
      //  • never for decision nodes with >1 outputs
      //  • always for single-output (even if decision)
      //  • otherwise only if not blocked & not done
      const shouldRecurse = !blocked && !done && (outgoing.length === 1 || !isDecisionNode);
      if (shouldRecurse) {
        const result = calculateLevelsAndAvailableNodes(nodes, edges, target.id, completedNodeIds, nextBranch, level + 1, currentNodeId);
        maxLevel = Math.max(maxLevel, result.levels);
        availableNodes.push(...result.availableNodes);
      }
    });

    return { levels: maxLevel, availableNodes };
  };

  return {
    updateNodeStyles,
    calculateLevelsAndAvailableNodes,
    initializeNodeSpecificStates,
  };
}
