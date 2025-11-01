import { Prisma } from '@zenstackhq/runtime/models';

// Default select for Requirements
export const RequirementTypeDefaultArgs = Prisma.validator<Prisma.RequirementTypeDefaultArgs>()({
  select: { id: true, name: true, description: true },
});

// Type for Requirements with selected fields
export type RequirementType = Prisma.RequirementTypeGetPayload<typeof RequirementTypeDefaultArgs>;

export type RequirementOptionType = {
  value: string;
  label: string;
};
