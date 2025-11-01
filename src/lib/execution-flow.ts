import { nodeLabels } from '@/constants/execution-flow';
import { ExecutionFlowValues } from '@/services/schemas/execution-flow';
import { Locale } from 'next-intl';

import type {
  AnnotationNodeData,
  AnnotationNodeType,
  ApprovalNodeData,
  ApprovalNodeType,
  AvailableNode,
  ConditionNodeData,
  ConditionNodeType,
  EndNodeData,
  FlowEdge,
  FlowNode,
  FlowNodeType,
  GatewayNodeData,
  LoopNodeData,
  LoopNodeType,
  MessageNodeData,
  MessageNodeType,
  NodeData,
  NotificationNodeData,
  NotificationNodeType,
  StartNodeData,
  StepNodeData,
  StepNodeType,
  SubProcessNodeData,
  TaskNodeData,
  TaskNodeType,
  TimerNodeData,
} from '@/types/execution-flow';
import { ExecutionFlowDetailedType } from '@/types/zenstackhq/execution-flow';

export const getDefaultDataForType = <T extends FlowNodeType>(type: T, locale: Locale): NodeData<T> => {
  const label = nodeLabels[locale][type];

  switch (type) {
    case 'start':
      return { label, linkedGuides: [] as string[] } satisfies StartNodeData as NodeData<T>;
    case 'end':
      return { label, linkedGuides: [] as string[] } satisfies EndNodeData as NodeData<T>;
    case 'step':
      return {
        label,
        action: '',
        responsible: '',
        sla: '',
        estimatedTime: 15,
        timeUnit: 'minutes',
        linkedGuides: [] as string[],
      } satisfies StepNodeData as NodeData<T>;
    case 'task':
      return {
        label,
        type: 'manual',
        details: '',
        estimatedTime: 20,
        timeUnit: 'minutes',
        linkedGuides: [] as string[],
      } satisfies TaskNodeData as NodeData<T>;
    case 'approval':
      return {
        label,
        approvers: [] as string[],
        estimatedTime: 30,
        timeUnit: 'minutes',
        linkedGuides: [] as string[],
      } satisfies ApprovalNodeData as NodeData<T>;
    case 'timer':
      return {
        label,
        duration: 0,
        timeUnit: 'minutes',
        linkedGuides: [] as string[],
      } satisfies TimerNodeData as NodeData<T>;
    case 'condition':
      return { label, expression: '', linkedGuides: [] as string[] } satisfies ConditionNodeData as NodeData<T>;
    case 'loop':
      return { label, condition: '', maxIterations: 10, linkedGuides: [] as string[] } satisfies LoopNodeData as NodeData<T>;
    case 'subprocess':
      return { label, processRef: '', linkedGuides: [] as string[] } satisfies SubProcessNodeData as NodeData<T>;
    case 'notification':
      return { label, channel: 'email', message: '', linkedGuides: [] as string[] } satisfies NotificationNodeData as NodeData<T>;
    case 'gateway':
      return { label, type: 'parallel', linkedGuides: [] as string[] } satisfies GatewayNodeData as NodeData<T>;
    case 'message':
      return { label, message: '', linkedGuides: [] as string[] } satisfies MessageNodeData as NodeData<T>;
    case 'annotation':
      return { label, text: '', linkedGuides: [] as string[] } satisfies AnnotationNodeData as NodeData<T>;
    default:
      const exhaustiveCheck: never = type;
      throw new Error(`Unhandled node type: ${exhaustiveCheck}`);
  }
};

//todo: Sometimes a completed node can be called again and that's because a loop node can be calling it again,
// so we need to find a way to handle that
export const calculateLevelsAndAvailableNodes = (
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

export const transformExecutionFlowToZodSchema = (prismaFlow: ExecutionFlowDetailedType): ExecutionFlowValues => {
  return {
    nodes: prismaFlow.nodes.map((node) => {
      const baseData = JSON.parse(node.config);
      const commonNode = {
        id: node.id,
        type: node.type,
        position: { x: node.positionX, y: node.positionY },
        measured: {
          width: baseData.measured?.width || 100,
          height: baseData.measured?.height || 40,
        },
        selected: false,
        dragging: false,
        data: {
          label: baseData.label || '',
          isExecuting: baseData.isExecuting || false,
          isCompleted: baseData.isCompleted || false,
          linkedGuides: node.nodeGuide.map((g) => g.guideId),
        },
      };

      switch (node.type) {
        case 'start':
          return { ...commonNode, data: { ...commonNode.data } };

        case 'end':
          return { ...commonNode, data: { ...commonNode.data } };

        case 'step':
          return {
            ...commonNode,
            data: {
              ...commonNode.data,
              action: baseData.action || '',
              responsible: baseData.responsible || '',
              sla: baseData.sla?.toString() || '',
              estimatedTime: Number(baseData.estimatedTime) || 0,
              timeUnit: baseData.timeUnit || 'minutes',
            },
          };

        case 'condition':
          return {
            ...commonNode,
            data: {
              ...commonNode.data,
              expression: baseData.expression || '',
            },
          };

        case 'loop':
          return {
            ...commonNode,
            data: {
              ...commonNode.data,
              condition: baseData.condition || '',
              maxIterations: Number(baseData.maxIterations) || 0,
            },
          };

        case 'subprocess':
          return {
            ...commonNode,
            data: {
              ...commonNode.data,
              processRef: baseData.processRef || '',
            },
          };

        case 'task':
          return {
            ...commonNode,
            data: {
              ...commonNode.data,
              type: baseData.type || 'manual',
              details: baseData.details || '',
              estimatedTime: Number(baseData.estimatedTime) || 0,
              timeUnit: baseData.timeUnit || 'minutes',
            },
          };

        case 'approval':
          return {
            ...commonNode,
            data: {
              ...commonNode.data,
              approvers: baseData.approvers || [],
              estimatedTime: Number(baseData.estimatedTime) || 0,
              timeUnit: baseData.timeUnit || 'minutes',
            },
          };

        case 'notification':
          return {
            ...commonNode,
            data: {
              ...commonNode.data,
              channel: baseData.channel || 'email',
              message: baseData.message || '',
            },
          };

        case 'timer':
          return {
            ...commonNode,
            data: {
              ...commonNode.data,
              duration: Number(baseData.duration) || 0,
              timeUnit: baseData.timeUnit || 'minutes',
            },
          };

        case 'gateway':
          return {
            ...commonNode,
            data: {
              ...commonNode.data,
              type: baseData.type || 'parallel',
            },
          };

        case 'message':
          return {
            ...commonNode,
            data: {
              ...commonNode.data,
              message: baseData.message || '',
            },
          };

        case 'annotation':
          return {
            ...commonNode,
            data: {
              ...commonNode.data,
              text: baseData.text || '',
            },
          };

        default:
          return {
            ...commonNode,
            type: 'unknown',
            data: commonNode.data,
          };
      }
    }),
    edges: prismaFlow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source.id,
      target: edge.target.id,
      animated: false,
      style: {
        stroke: edge.style ? JSON.parse(edge.style).stroke : '#555',
      },
      markerEnd: edge.markerEnd
        ? JSON.parse(edge.markerEnd)
        : {
            type: 'arrowclosed',
            width: 20,
            height: 20,
          },
      type: 'smoothstep',
      sourceHandle: edge.sourceHandle || undefined,
    })),
    viewport: {
      x: prismaFlow.viewportX || 0,
      y: prismaFlow.viewportY || 0,
      zoom: prismaFlow.viewportZoom || 1,
    },
  };
};

// Type guards
export const isLoopNode = (node: FlowNode): node is LoopNodeType => node.type === 'loop';
export const isStepNode = (node: FlowNode): node is StepNodeType => node.type === 'step';
export const isMessageNode = (node: FlowNode): node is MessageNodeType => node.type === 'message';
export const isConditionNode = (node: FlowNode): node is ConditionNodeType => node.type === 'condition';
export const isAnnotationNode = (node: FlowNode): node is AnnotationNodeType => node.type === 'annotation' && 'text' in node.data;

// Type guard: checks if the FlowNode has a 'message' property (for notification or message nodes)
export const isNodeWithMessage = (node: FlowNode): node is NotificationNodeType | MessageNodeType => node.type === 'notification' || (node.type === 'message' && 'message' in node.data);

// Type guard: checks if the FlowNode has both 'estimatedTime' and 'timeUnit' properties (for step, task, approval, or timer nodes)
export const isNodeWithEstimatedTime = (node: FlowNode): node is StepNodeType | TaskNodeType | ApprovalNodeType => {
  return (node.type === 'step' || node.type === 'task' || node.type === 'approval') && 'estimatedTime' in node.data && 'timeUnit' in node.data;
};

export const isValidNodeType = (type: string): type is FlowNodeType => {
  const validTypes: FlowNodeType[] = ['start', 'end', 'step', 'condition', 'loop', 'subprocess', 'task', 'approval', 'notification', 'timer', 'gateway', 'message', 'annotation'];
  return validTypes.includes(type as FlowNodeType);
};
