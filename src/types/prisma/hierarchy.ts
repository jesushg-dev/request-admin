import { Prisma } from '@prisma/client';

// Default select for Request Hierarchy
export const RequestHierarchyDefaultArgs = Prisma.validator<Prisma.RequestHierarchyDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    levels: { select: { id: true, name: true, position: true }, orderBy: { position: 'asc' } },
  },
});

// Type for Hierarchy with selected fields
export type RequestHierarchyWithLevelsType = Prisma.RequestHierarchyGetPayload<typeof RequestHierarchyDefaultArgs>;
export type RequestLevelType = RequestHierarchyWithLevelsType['levels'][0];

// Default select for Assignment Hierarchy
export const AssignmentHierarchyDefaultArgs = Prisma.validator<Prisma.AssignmentHierarchyDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    levels: { select: { id: true, name: true, position: true }, orderBy: { position: 'asc' } },
  },
});

export type AssignmentHierarchyWithLevelsType = Prisma.AssignmentHierarchyGetPayload<typeof AssignmentHierarchyDefaultArgs>;
export type AssignmentLevelType = AssignmentHierarchyWithLevelsType['levels'][0];
