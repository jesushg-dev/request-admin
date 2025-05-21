import type {
  AnnotationNodeData,
  AnnotationNodeType,
  ApprovalNodeData,
  ApprovalNodeType,
  ConditionNodeData,
  ConditionNodeType,
  EndNodeData,
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

export const getDefaultDataForType = <T extends FlowNodeType>(type: T): NodeData<T> => {
  switch (type) {
    case 'start':
      return { label: 'Inicio', linkedGuides: [] as string[] } satisfies StartNodeData as NodeData<T>;

    case 'end':
      return { label: 'Fin', linkedGuides: [] as string[] } satisfies EndNodeData as NodeData<T>;

    case 'step':
      return {
        label: 'Paso',
        action: '',
        responsible: '',
        sla: '',
        estimatedTime: 15,
        timeUnit: 'minutes',
        linkedGuides: [] as string[],
      } satisfies StepNodeData as NodeData<T>;

    case 'task':
      return {
        label: 'Tarea',
        type: 'manual',
        details: '',
        estimatedTime: 20,
        timeUnit: 'minutes',
        linkedGuides: [] as string[],
      } satisfies TaskNodeData as NodeData<T>;

    case 'approval':
      return {
        label: 'Aprobación',
        approvers: [] as string[],
        estimatedTime: 30,
        timeUnit: 'minutes',
        linkedGuides: [] as string[],
      } satisfies ApprovalNodeData as NodeData<T>;

    case 'timer':
      return {
        label: 'Temporizador',
        duration: 0,
        timeUnit: 'minutes',
        linkedGuides: [] as string[],
      } satisfies TimerNodeData as NodeData<T>;

    case 'condition':
      return { label: 'Condición', expression: '', linkedGuides: [] as string[] } satisfies ConditionNodeData as NodeData<T>;

    case 'loop':
      return { label: 'Bucle', condition: '', maxIterations: 10, linkedGuides: [] as string[] } satisfies LoopNodeData as NodeData<T>;

    case 'subprocess':
      return { label: 'Subproceso', processRef: '', linkedGuides: [] as string[] } satisfies SubProcessNodeData as NodeData<T>;

    case 'notification':
      return { label: 'Notificación', channel: 'email', message: '', linkedGuides: [] as string[] } satisfies NotificationNodeData as NodeData<T>;

    case 'gateway':
      return { label: 'Gateway', type: 'parallel', linkedGuides: [] as string[] } satisfies GatewayNodeData as NodeData<T>;

    case 'message':
      return { label: 'Evento de Mensaje', message: '', linkedGuides: [] as string[] } satisfies MessageNodeData as NodeData<T>;

    case 'annotation':
      return { label: 'Anotación', text: '', linkedGuides: [] as string[] } satisfies AnnotationNodeData as NodeData<T>;
    default:
      const exhaustiveCheck: never = type;
      throw new Error(`Unhandled node type: ${exhaustiveCheck}`);
  }
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
