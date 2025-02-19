'use server';

import { db } from '@/server/db-client';

import { generateUuid } from '@/lib/id';
import { RequestCategory, RequestCategoryFormValues } from '@/components/common/category/request-category-form';

type FlatCategory = RequestCategory & {
  _parentId?: string;
  depth: number;
};

export async function getRequestCategoriesByIds(rootIds: string[], tenantId: string): Promise<RequestCategoryFormValues> {
  const categoriesToFetch = new Set(rootIds);
  const categoryMap = new Map<string, RequestCategory & { parentCategoryId?: string | null }>();

  while (categoriesToFetch.size > 0) {
    const batchIds = Array.from(categoriesToFetch);
    categoriesToFetch.clear();

    // Get categories from the current batch and their direct children
    const dbCategories = await db.requestCategory.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        hierarchyLevelId: true,
        parentCategoryId: true,
        isEligibleForNewClients: true,
        requestCategoryRequirements: {
          select: {
            requirementId: true,
            requirement: { select: { name: true } },
          },
        },
        categoryForms: {
          select: {
            formId: true,
            form: { select: { name: true } },
          },
        },
        sla: {
          select: {
            id: true,
            resolutionTime: true,
            escalationTime: true,
          },
        },
      },
      where: {
        tenantId,
        OR: [
          { id: { in: batchIds } }, // Categories from the current batch
          { parentCategoryId: { in: batchIds } }, // Direct children of the current batch
        ],
      },
    });

    // Register categories and prepare the next iteration
    dbCategories.forEach((cat) => {
      if (!categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, {
          id: cat.id,
          name: cat.name,
          description: cat.description || undefined,
          isActive: cat.isActive,
          hierarchyLevelId: cat.hierarchyLevelId,
          subcategories: [],
          isEligibleForNewClients: cat.isEligibleForNewClients,
          isSubCategoryVisible: true,
          requirements: cat.requestCategoryRequirements.map((r) => ({
            value: r.requirementId,
            label: r.requirement.name || '',
          })),
          forms: cat.categoryForms.map((f) => ({
            value: f.formId,
            label: f.form.name || '',
          })),
          sla: cat.sla
            ? {
                id: cat.sla.id,
                resolutionTime: cat.sla.resolutionTime ?? 0,
                escalationTime: cat.sla.escalationTime ?? 0,
              }
            : { id: generateUuid(), resolutionTime: 0, escalationTime: 0 },
          parentCategoryId: cat.parentCategoryId,
        });
      }

      // If the category is a direct child of the current batch, add its ID to search for its children
      if (cat.parentCategoryId && batchIds.includes(cat.parentCategoryId)) {
        categoriesToFetch.add(cat.id);
      }
    });
  }

  // Build the hierarchical tree
  categoryMap.forEach((cat) => {
    if (cat.parentCategoryId && categoryMap.has(cat.parentCategoryId)) {
      const parent = categoryMap.get(cat.parentCategoryId);
      if (parent) {
        parent.subcategories.push(cat);
      }
    }
  });

  // Retrieve only the root categories
  const categories = rootIds.map((rootId) => categoryMap.get(rootId)).filter((cat): cat is RequestCategory => cat !== undefined);

  return { categories };
}

/**
 * Upserts a flat array of RequestCategory objects into the database.
 * This function processes categories from parents to children (using the depth property)
 * and performs nested upserts for categoryForms and requestCategoryRequirements.
 *
 * It also handles deletion of orphaned nested records: if a form or requirement is not
 * present in the current category data, it is deleted.
 *
 * @param categories - An array of RequestCategory objects arranged in a tree structure
 * @param tenantId - The tenant identifier
 * @param hierarchyId - The hierarchy identifier
 */
export async function upsertCategoriesFlat(categories: RequestCategory[], tenantId: string, hierarchyId: string) {
  // Flatten the category tree and sort by depth (parents first)
  const flatCategories = flattenCategories(categories).sort((a, b) => a.depth - b.depth);

  await db.$transaction(
    async (tx) => {
      for (const cat of flatCategories) {
        // Extract form and requirement IDs from the incoming data.
        // If the arrays are undefined, treat them as empty arrays (which will delete existing nested records).
        const formIds: string[] = cat.forms ? cat.forms.map((f) => String(f.value)) : [];
        const requirementIds: string[] = cat.requirements ? cat.requirements.map((r) => String(r.value)) : [];

        await tx.requestCategory.upsert({
          where: { id: cat.id },
          create: {
            id: cat.id,
            name: cat.name,
            description: cat.description,
            // For creation, isActive is derived from isSubCategoryVisible (as in the original logic)
            isActive: cat.isSubCategoryVisible,
            isEligibleForNewClients: cat.isEligibleForNewClients,
            tenantId,
            // Set parentCategoryId to the provided _parentId or null if there is none
            parentCategoryId: cat._parentId ? cat._parentId : null,
            hierarchyId,
            hierarchyLevelId: cat.hierarchyLevelId,
            // Create nested CategoryForms records from the provided forms array
            categoryForms: {
              create:
                cat.forms?.map((f) => ({
                  tenantId,
                  formId: String(f.value),
                })) ?? [],
            },
            // Create nested RequestCategoryRequirements records from the provided requirements array
            requestCategoryRequirements: {
              create:
                cat.requirements?.map((r) => ({
                  tenantId,
                  requirementId: String(r.value),
                })) ?? [],
            },
            // Create nested SLA record if provided
            sla: cat.sla
              ? {
                  create: {
                    tenantId,
                    resolutionTime: cat.sla.resolutionTime ?? 0,
                    escalationTime: cat.sla.escalationTime ?? 0,
                    id: cat.sla.id,
                  },
                }
              : undefined,
          },
          update: {
            name: cat.name,
            description: cat.description,
            isActive: cat.isSubCategoryVisible,
            isEligibleForNewClients: cat.isEligibleForNewClients,
            tenantId,
            hierarchyId,
            parentCategoryId: cat._parentId ? cat._parentId : null,
            hierarchyLevelId: cat.hierarchyLevelId,
            // For nested CategoryForms, first delete any forms that are not present in the incoming data,
            // then upsert each provided form.
            categoryForms: {
              deleteMany: {
                formId: { notIn: formIds },
              },
              upsert:
                cat.forms?.map((f) => ({
                  where: {
                    // The unique index is assumed to be based on (categoryId, formId, tenantId)
                    categoryId_formId_tenantId: {
                      categoryId: cat.id,
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
            // For nested RequestCategoryRequirements, delete any requirements not present in the incoming data,
            // then upsert each provided requirement.
            requestCategoryRequirements: {
              deleteMany: {
                requirementId: { notIn: requirementIds },
              },
              upsert:
                cat.requirements?.map((r) => ({
                  where: {
                    // The unique index is assumed to be based on (categoryId, requirementId, tenantId)
                    categoryId_requirementId_tenantId: {
                      categoryId: cat.id,
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
            // For the nested SLA record, use upsert to create or update it as needed.
            sla: cat.sla
              ? {
                  upsert: {
                    where: {
                      id: cat.sla.id,
                      tenantId,
                    },
                    create: {
                      tenantId,
                      resolutionTime: cat.sla.resolutionTime ?? 0,
                      escalationTime: cat.sla.escalationTime ?? 0,
                      id: cat.sla.id,
                    },
                    update: {
                      tenantId,
                      resolutionTime: cat.sla.resolutionTime ?? 0,
                      escalationTime: cat.sla.escalationTime ?? 0,
                      id: cat.sla.id,
                    },
                  },
                }
              : undefined,
          },
        });
      }
    },
    {
      maxWait: 5000, // 5 seconds max wait to connect to prisma
      timeout: 20000, // 20 seconds
    }
  );
}

function flattenCategories(categories: RequestCategory[], parentId?: string, depth: number = 0): FlatCategory[] {
  let flat: FlatCategory[] = [];
  for (const cat of categories) {
    const flatCat: FlatCategory = { ...cat, _parentId: parentId, depth };
    flat.push(flatCat);
    if (cat.subcategories && cat.subcategories.length > 0) {
      flat = flat.concat(flattenCategories(cat.subcategories, cat.id, depth + 1));
    }
  }
  return flat;
}
