// types/flow.ts
import type { Edge, EdgeMarker, Node } from '@xyflow/react';

// Base type with index signature
export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  linkedGuides: string[];
  isExecuting?: boolean;
  isCompleted?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StartNodeData extends BaseNodeData {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EndNodeData extends BaseNodeData {}

export interface StepNodeData extends BaseNodeData {
  action: string;
  responsible: string;
  estimatedTime: number;
  timeUnit: 'seconds' | 'minutes' | 'hours' | 'days';
  sla: string;
}

export interface ConditionNodeData extends BaseNodeData {
  expression: string;
}

export interface LoopNodeData extends BaseNodeData {
  condition: string;
  maxIterations: number;
}

export interface SubProcessNodeData extends BaseNodeData {
  processRef: string;
}

export interface TaskNodeData extends BaseNodeData {
  type: 'manual' | 'automatic' | 'api' | 'rpa';
  details: string;
  estimatedTime: number;
  timeUnit: 'seconds' | 'minutes' | 'hours' | 'days';
}

export interface ApprovalNodeData extends BaseNodeData {
  approvers: string[];
  estimatedTime: number;
  timeUnit: 'seconds' | 'minutes' | 'hours' | 'days';
}

export interface NotificationNodeData extends BaseNodeData {
  message: string;
  channel: 'email' | 'sms' | 'alert';
}

export interface TimerNodeData extends BaseNodeData {
  duration: number;
  timeUnit: 'seconds' | 'minutes' | 'hours' | 'days';
}

export interface GatewayNodeData extends BaseNodeData {
  type: 'parallel' | 'inclusive';
}

export interface MessageNodeData extends BaseNodeData {
  message: string;
}

export interface AnnotationNodeData extends BaseNodeData {
  text: string;
}

// Node types
export type StartNodeType = Node<StartNodeData, 'start'>;
export type EndNodeType = Node<EndNodeData, 'end'>;
export type StepNodeType = Node<StepNodeData, 'step'>;
export type ConditionNodeType = Node<ConditionNodeData, 'condition'>;
export type LoopNodeType = Node<LoopNodeData, 'loop'>;
export type SubProcessNodeType = Node<SubProcessNodeData, 'subprocess'>;
export type TaskNodeType = Node<TaskNodeData, 'task'>;
export type ApprovalNodeType = Node<ApprovalNodeData, 'approval'>;
export type NotificationNodeType = Node<NotificationNodeData, 'notification'>;
export type TimerNodeType = Node<TimerNodeData, 'timer'>;
export type GatewayNodeType = Node<GatewayNodeData, 'gateway'>;
export type MessageNodeType = Node<MessageNodeData, 'message'>;
export type AnnotationNodeType = Node<AnnotationNodeData, 'annotation'>;

export type FlowNodeType = 'start' | 'end' | 'step' | 'condition' | 'loop' | 'subprocess' | 'task' | 'approval' | 'notification' | 'timer' | 'gateway' | 'message' | 'annotation';

export type FlowNode =
  | StartNodeType
  | EndNodeType
  | StepNodeType
  | ConditionNodeType
  | LoopNodeType
  | SubProcessNodeType
  | TaskNodeType
  | ApprovalNodeType
  | NotificationNodeType
  | TimerNodeType
  | GatewayNodeType
  | MessageNodeType
  | AnnotationNodeType;

// Edge type
export interface FlowEdge extends Edge<Record<string, unknown>> {
  label?: string;
  labelStyle?: React.CSSProperties;
  labelBgStyle?: React.CSSProperties;
  markerEnd?: EdgeMarker;
}

// Process Flow type
export interface ProcessFlow {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export type NodeData<T extends FlowNodeType> = T extends 'start'
  ? BaseNodeData
  : T extends 'end'
    ? BaseNodeData
    : T extends 'step'
      ? StepNodeData
      : T extends 'condition'
        ? ConditionNodeData
        : T extends 'loop'
          ? LoopNodeData
          : T extends 'subprocess'
            ? SubProcessNodeData
            : T extends 'task'
              ? TaskNodeData
              : T extends 'approval'
                ? ApprovalNodeData
                : T extends 'notification'
                  ? NotificationNodeData
                  : T extends 'timer'
                    ? TimerNodeData
                    : T extends 'gateway'
                      ? GatewayNodeData
                      : T extends 'message'
                        ? MessageNodeData
                        : T extends 'annotation'
                          ? AnnotationNodeData
                          : never;

/**
 * EXECUTION VIEWER
 */

export type IntegrationStatus = 'connected' | 'error' | 'pending' | 'disconnected';

export interface ParallelGroup {
  total: number;
  completed: number;
}

export interface ParallelGroups {
  [key: string]: ParallelGroup;
}

export enum ExecutionHistoryActions {
  START = 'start',
  COMPLETE = 'complete',
  FAIL = 'fail',
  PENDING = 'pending',
}

export interface ExecutionHistoryEntry {
  timestamp: Date;
  nodeId: string;
  action: ExecutionHistoryActions;
  details?: string;
}

export interface DecisionOption {
  label: string;
  value: string;
  target?: string;
  bgClass?: string;
}

export interface PendingDecision {
  nodeId: string;
  type: string;
  options: DecisionOption[];
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
