import { Prisma } from '@prisma/client';

// Default select for Modules
export const ModuleDefaultArgs = Prisma.validator<Prisma.ModuleDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    isActive: true,
    feature: { select: { id: true, name: true, scope: true, description: true, isActive: true }, orderBy: { name: 'asc' } },
  },
});

// Type for Modules with selected fields
export type ModuleWithFeaturesType = Prisma.ModuleGetPayload<typeof ModuleDefaultArgs>;
