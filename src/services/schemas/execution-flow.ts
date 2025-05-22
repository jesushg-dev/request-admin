import { z } from 'zod';

import {
  AnnotationNodeData,
  ApprovalNodeData,
  ConditionNodeData,
  EndNodeData,
  GatewayNodeData,
  LoopNodeData,
  MessageNodeData,
  NotificationNodeData,
  StartNodeData,
  StepNodeData,
  SubProcessNodeData,
  TaskNodeData,
  TimerNodeData,
} from '@/types/execution-flow';

// Shared base schema for `data`
const baseData = z.object({
  label: z.string(),
  linkedGuides: z.array(z.string()),
  isExecuting: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
});

// Common node shape without `type`
const baseNode = z.object({
  id: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  measured: z.object({ width: z.number().optional(), height: z.number().optional() }).optional(),
  selected: z.boolean().optional(),
  dragging: z.boolean().optional(),
});

// Specialized node schemas with explicit `type`
const startNode = baseNode.extend({
  type: z.literal('start'),
  data: baseData as z.ZodType<StartNodeData>,
});

const endNode = baseNode.extend({
  type: z.literal('end'),
  data: baseData as z.ZodType<EndNodeData>,
});

const stepNode = baseNode.extend({
  type: z.literal('step'),
  data: baseData.extend({
    action: z.string(),
    responsible: z.string(),
    sla: z.string(),
    estimatedTime: z.number(),
    timeUnit: z.enum(['seconds', 'minutes', 'hours', 'days']),
  }) as z.ZodType<StepNodeData>,
});

const conditionNode = baseNode.extend({
  type: z.literal('condition'),
  data: baseData.extend({
    expression: z.string(),
  }) as z.ZodType<ConditionNodeData>,
});

const loopNode = baseNode.extend({
  type: z.literal('loop'),
  data: baseData.extend({
    condition: z.string(),
    maxIterations: z.number(),
  }) as z.ZodType<LoopNodeData>,
});

const subprocessNode = baseNode.extend({
  type: z.literal('subprocess'),
  data: baseData.extend({
    processRef: z.string(),
  }) as z.ZodType<SubProcessNodeData>,
});

const taskNode = baseNode.extend({
  type: z.literal('task'),
  data: baseData.extend({
    type: z.enum(['manual', 'automatic', 'api', 'rpa']),
    details: z.string(),
    estimatedTime: z.number(),
    timeUnit: z.enum(['seconds', 'minutes', 'hours', 'days']),
  }) as z.ZodType<TaskNodeData>,
});

const approvalNode = baseNode.extend({
  type: z.literal('approval'),
  data: baseData.extend({
    approvers: z.array(z.string()),
    estimatedTime: z.number(),
    timeUnit: z.enum(['seconds', 'minutes', 'hours', 'days']),
  }) as z.ZodType<ApprovalNodeData>,
});

const notificationNode = baseNode.extend({
  type: z.literal('notification'),
  data: baseData.extend({
    channel: z.enum(['email', 'sms', 'alert']),
    message: z.string(),
  }) as z.ZodType<NotificationNodeData>,
});

const timerNode = baseNode.extend({
  type: z.literal('timer'),
  data: baseData.extend({
    duration: z.number(),
    timeUnit: z.enum(['seconds', 'minutes', 'hours', 'days']),
  }) as z.ZodType<TimerNodeData>,
});

const gatewayNode = baseNode.extend({
  type: z.literal('gateway'),
  data: baseData.extend({
    type: z.enum(['parallel', 'inclusive']),
  }) as z.ZodType<GatewayNodeData>,
});

const messageNode = baseNode.extend({
  type: z.literal('message'),
  data: baseData.extend({
    message: z.string(),
  }) as z.ZodType<MessageNodeData>,
});

const annotationNode = baseNode.extend({
  type: z.literal('annotation'),
  data: baseData.extend({
    text: z.string(),
  }) as z.ZodType<AnnotationNodeData>,
});

// Fallback schema for nodes where `type` is missing or undefined
const unknownNode = baseNode.extend({
  type: z.string(),
  data: baseData,
});

// Discriminated union for known types plus fallback unknown
const nodeSchema = z.union([
  z.discriminatedUnion('type', [startNode, endNode, stepNode, conditionNode, loopNode, subprocessNode, taskNode, approvalNode, notificationNode, timerNode, gatewayNode, messageNode, annotationNode]),
  unknownNode,
]);

// Edge schema
const edgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  id: z.string(),
  animated: z.boolean(),
  style: z.object({
    stroke: z.string(),
  }),
  markerEnd: z.object({
    type: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
  type: z.string(),
  sourceHandle: z.string().optional(),
});

// Final flow schema
export const executionFlowSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number(),
  }),
});

export type ExecutionFlowValues = z.infer<typeof executionFlowSchema>;
