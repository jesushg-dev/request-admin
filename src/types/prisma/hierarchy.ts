import { Prisma } from '@prisma/client';

// Default select for Hierarchy
export const HierarchyDefaultArgs = Prisma.validator<Prisma.HierarchyDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    levels: { select: { id: true, name: true, position: true } },
  },
});

// Type for Hierarchy with selected fields
export type HierarchyWithLevelsType = Prisma.HierarchyGetPayload<typeof HierarchyDefaultArgs>;
export type LevelType = HierarchyWithLevelsType['levels'][0];
