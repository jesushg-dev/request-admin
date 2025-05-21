import { Prisma } from '@prisma/client';

// Default select for Requirements
export const RequestPriorityTypeDefaultArgs = Prisma.validator<Prisma.RequestPriorityTypeDefaultArgs>()({
  select: { id: true, name: true, description: true },
});

// Type for Requirements with selected fields
export type RequestPriorityType = Prisma.RequestPriorityTypeGetPayload<typeof RequestPriorityTypeDefaultArgs>;

export type RequirementOptionType = {
  value: string;
  label: string;
};
