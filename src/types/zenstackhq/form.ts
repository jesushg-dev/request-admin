import { Prisma } from '@zenstackhq/runtime/models';

export const FormDefaultArgs = Prisma.validator<Prisma.FormDefaultArgs>()({
  select: {
    id: true,
    name: true,
    tenantId: true,
    description: true,
    createdAt: true,
    published: true,
    visits: true,
    submissions: true,
  },
});

export type FormWithRelations = Prisma.FormGetPayload<typeof FormDefaultArgs>;

export interface DynamicColumn {
  id: string;
  label: string;
  type: string;
}
