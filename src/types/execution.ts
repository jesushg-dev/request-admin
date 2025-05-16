// Tipos para los nodos
export interface NodeData {
  label: string;
  action?: string;
  responsible?: string;
  sla?: string;
  estimatedTime?: number;
  timeUnit?: string;
  expression?: string;
  condition?: string;
  maxIterations?: number;
  processRef?: string;
  type?: string;
  details?: string;
  approvers?: string[];
  channel?: string;
  message?: string;
  duration?: number;
  status?: string;
  isExecuting?: boolean;
  isCompleted?: boolean;
}

export interface FlowNode {
  id: string;
  type: string;
  data: NodeData;
  position: { x: number; y: number };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  labelStyle?: Record<string, unknown>;
  labelBgStyle?: Record<string, unknown>;
  markerEnd?: {
    type: string;
    width: number;
    height: number;
  };
}

export interface ProcessFlow {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// Tipos para el estado de ejecución
export type IntegrationStatus = 'connected' | 'error' | 'pending' | 'disconnected';

export interface NodeSpecificState {
  timer?: {
    timeLeft: number;
    timerActive: boolean;
  };
  notification?: {
    status: 'idle' | 'sending' | 'success' | 'error';
  };
  task?: {
    status: 'idle' | 'running' | 'success' | 'error';
  };
  message?: {
    shown: boolean;
  };
  loop?: {
    count: number;
  };
}

export interface NodeSpecificStates {
  [nodeId: string]: NodeSpecificState;
}

export interface ParallelGroup {
  total: number;
  completed: number;
}

export interface ParallelGroups {
  [key: string]: ParallelGroup;
}

export interface ExecutionHistoryEntry {
  timestamp: Date;
  nodeId: string;
  action: string;
  details?: string;
}

export interface PendingDecision {
  nodeId: string;
  type: string;
  options: {
    label: string;
    value: string;
    target?: string;
  }[];
}

export interface AvailableNode {
  node: FlowNode;
  isActive: boolean;
  isCompleted: boolean;
  isBlocked: boolean;
  dependenciesCompleted: boolean;
  level: number;
  branch: string;
  parentId?: string;
}
