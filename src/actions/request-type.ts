import { db } from '@/server/db-client';

type SLA = {
  id?: string;
  resolutionTime?: number;
  escalationTime?: number;
};

type FormValue = {
  value: string;
};

type RequirementValue = {
  value: string;
};

type Category = {
  id?: string;
  name: string;
  description?: string;
  isSubCategoryVisible?: boolean;
  isEligibleForNewClients?: boolean;
  hierarchyLevelId: string;
  forms?: FormValue[];
  requirements?: RequirementValue[];
  sla?: SLA;
  subcategories?: Category[];
};

export async function upsertCategoriesFlat(categories: Category[], tenantId: string, hierarchyId: string) {
  const ops: ReturnType<typeof db.requestCategory.upsert>[] = [];

  function collectOps(cat: Category) {
    ops.push(
      db.requestCategory.upsert({
        where: { id: cat.id ?? '', tenantId },
        create: {
          name: cat.name,
          description: cat.description,
          isActive: cat.isSubCategoryVisible,
          isEligibleForNewClients: cat.isEligibleForNewClients,
          tenantId,
          hierarchyId,
          hierarchyLevelId: cat.hierarchyLevelId,
          categoryForms: {
            create:
              cat.forms?.map((f) => ({
                tenantId,
                formId: String(f.value),
              })) ?? [],
          },
          requestCategoryRequirements: {
            create:
              cat.requirements?.map((r) => ({
                tenantId,
                requirementId: String(r.value),
              })) ?? [],
          },
          sla: {
            create: {
              tenantId,
              resolutionTime: cat.sla?.resolutionTime ?? 0,
              escalationTime: cat.sla?.escalationTime ?? 0,
              id: cat.sla?.id,
            },
          },
        },
        update: {
          name: cat.name,
          description: cat.description,
          isActive: cat.isSubCategoryVisible,
          isEligibleForNewClients: cat.isEligibleForNewClients,
          tenantId,
          hierarchyId,
          hierarchyLevelId: cat.hierarchyLevelId,
          categoryForms: {
            upsert:
              cat.forms?.map((f) => ({
                where: {
                  categoryId_formId_tenantId: {
                    categoryId: cat.id ?? '',
                    formId: String(f.value),
                    tenantId,
                  },
                },
                create: {
                  tenantId,
                  formId: String(f.value),
                },
                update: {
                  tenantId,
                  formId: String(f.value),
                },
              })) ?? [],
          },
          requestCategoryRequirements: {
            upsert:
              cat.requirements?.map((r) => ({
                where: {
                  categoryId_requirementId_tenantId: {
                    categoryId: cat.id ?? '',
                    requirementId: String(r.value),
                    tenantId,
                  },
                },
                create: {
                  tenantId,
                  requirementId: String(r.value),
                },
                update: {
                  tenantId,
                  requirementId: String(r.value),
                },
              })) ?? [],
          },
          sla: {
            upsert: {
              where: {
                id: cat.sla?.id ?? '',
                tenantId,
              },
              create: {
                tenantId,
                resolutionTime: cat.sla?.resolutionTime ?? 0,
                escalationTime: cat.sla?.escalationTime ?? 0,
                id: cat.sla?.id,
              },
              update: {
                tenantId,
                resolutionTime: cat.sla?.resolutionTime ?? 0,
                escalationTime: cat.sla?.escalationTime ?? 0,
                id: cat.sla?.id,
              },
            },
          },
        },
      })
    );

    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        collectOps(sub);
      }
    }
  }

  for (const cat of categories) {
    collectOps(cat);
  }

  await db.$transaction(ops);
}
