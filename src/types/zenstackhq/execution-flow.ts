import { Prisma } from '@zenstackhq/runtime/models';

export const ExecutionFlowDefaultArgs = Prisma.validator<Prisma.ExecutionFlowDefinitionDefaultArgs>()({
  select: {
    id: true,
    version: true,
    viewportX: true,
    viewportY: true,
    viewportZoom: true,
    nodes: {
      select: {
        id: true,
        type: true,
        positionX: true,
        positionY: true,
        config: true,
        nodeGuide: {
          select: {
            guideId: true,
          },
        },
      },
    },
    edges: {
      select: {
        id: true,
        source: true,
        target: true,
        sourceHandle: true,
        style: true,
        markerEnd: true,
      },
    },
  },
});

export type ExecutionFlowDetailedType = Prisma.ExecutionFlowDefinitionGetPayload<typeof ExecutionFlowDefaultArgs>;
