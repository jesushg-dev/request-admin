import { NodeTypes } from '@xyflow/react';

import { AnnotationNode } from './annotation-node';
import { ApprovalNode } from './approval-node';
import { ConditionNode } from './condition-node';
import { EndNode } from './end-node';
import { GatewayNode } from './gateway-node';
import { LoopNode } from './loop-node';
import { MessageNode } from './message-node';
import { NotificationNode } from './notification-node';
import { StartNode } from './start-node';
import { StepNode } from './step-node';
import { SubprocessNode } from './subprocess-node';
import { TaskNode } from './task-node';
import { TimerNode } from './timer-node';

// Define custom node types
export const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  step: StepNode,
  condition: ConditionNode,
  loop: LoopNode,
  subprocess: SubprocessNode,
  task: TaskNode,
  approval: ApprovalNode,
  notification: NotificationNode,
  timer: TimerNode,
  gateway: GatewayNode,
  message: MessageNode,
  annotation: AnnotationNode,
};
