'use server';

import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';
import { ExecutionFlowValues } from '@/services/schemas/execution-flow';

import { FlowNodeType } from '@/types/execution-flow';
import { UserNotFoundErr } from '@/lib/error';

export async function createExecutionFlow(processFlow: ExecutionFlowValues, requestCategoryId: string, tenantId: string) {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  return await db.$transaction(async (tx) => {
    // 1. Verify if there are any active executions for the request category
    const relatedRequests = await tx.request.findMany({
      where: {
        requestAssignments: {
          some: { isActive: true, requestCategoryId, tenantId },
        },
      },
      select: { id: true },
    });

    // 2. Get the active executions for the related requests
    const activeExecutions =
      relatedRequests.length > 0
        ? await tx.executionModelInstance.findMany({
            where: {
              requestId: { in: relatedRequests.map((r) => r.id) },
              status: { notIn: ['completed', 'failed'] },
            },
          })
        : [];

    // 3. Create a new execution flow version
    const existingFlow = await tx.executionFlowDefinition.findFirst({
      select: { id: true, version: true },
      where: { requestCategoryId },
      orderBy: { version: 'desc' },
    });

    const newFlow = await tx.executionFlowDefinition.create({
      data: {
        tenantId,
        version: existingFlow ? existingFlow.version + 1 : 1,
        requestCategoryId,
        viewportX: processFlow.viewport.x,
        viewportY: processFlow.viewport.y,
        viewportZoom: processFlow.viewport.zoom,
        nodes: {
          create: processFlow.nodes.map((node) => ({
            tenantId,
            id: node.id,
            type: node.type,
            positionX: node.position.x,
            positionY: node.position.y,
            config: JSON.stringify(node.data),
            nodeGuide: {
              create: (node.data.linkedGuides || []).map((guideId) => ({
                tenantId,
                guideId,
                applicationScope: 'full',
                order: 1,
              })),
            },
          })),
        },
        edges: {
          create: processFlow.edges.map((edge) => ({
            tenantId,
            id: edge.id,
            sourceId: edge.source,
            targetId: edge.target,
            sourceHandle: edge.sourceHandle,
            style: JSON.stringify(edge.style),
            markerEnd: JSON.stringify(edge.markerEnd),
          })),
        },
      },
      include: {
        nodes: true,
        edges: true,
      },
    });

    // 4. Create history records if there are active executions
    if (existingFlow) {
      await tx.executionModelHistory.createMany({
        data: activeExecutions.map((exec) => ({
          tenantId,
          previousFlowId: existingFlow?.id,
          newFlowId: newFlow.id,
          reason: 'Version update - Active execution migration',
          updatedAt: new Date(),
          executionId: exec.id,
        })),
      });
    }

    return newFlow;
  });
}

export async function createExecutionLog(tenantId: string, executionId: string, nodeId: string, eventType: FlowNodeType, data: Record<string, unknown>, outcome: 'success' | 'error' | 'warning') {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  return await db.$transaction(async (tx) => {
    const details = JSON.stringify(data);
    const newLog = await tx.executionModelLog.create({
      data: { executionId, nodeId, eventType, details: JSON.stringify(details), outcome, tenantId },
    });

    // todo: set the correct node here
    if (eventType === 'start') {
      await tx.executionModelInstance.update({
        where: { id: executionId },
        data: { status: 'in_progress' },
      });
    }

    return newLog;
  });
}
