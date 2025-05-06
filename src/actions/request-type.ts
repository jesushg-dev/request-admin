'use server';

import { db } from '@/server/db-client';

import { generateUuid } from '@/lib/id';
import { buildRequestCategoryUpsertArgs } from '@/lib/request-type';
import { RequestCategoryValues } from '@/components/common/request-type/category-form';
import { RequestTypeFormValues } from '@/components/common/request-type/request-type-form';

export async function getRequestCategoriesByIds(rootIds: string[], tenantId: string): Promise<RequestTypeFormValues> {
  const categoriesToFetch = new Set<string>(rootIds);
  const categoryMap = new Map<string, RequestCategoryValues>();

  // Fetch categories in BFS batches to handle deep hierarchies
  while (categoriesToFetch.size > 0) {
    const batchIds = Array.from(categoriesToFetch);
    categoriesToFetch.clear();

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
        OR: [{ id: { in: batchIds } }, { parentCategoryId: { in: batchIds } }],
      },
    });

    // Store categories and track children to fetch
    dbCategories.forEach((dbCat) => {
      if (!categoryMap.has(dbCat.id)) {
        const category: RequestCategoryValues = {
          id: dbCat.id,
          name: dbCat.name,
          description: dbCat.description || undefined,
          isActive: dbCat.isActive,
          hierarchyLevelId: dbCat.hierarchyLevelId,
          isEligibleForNewClients: dbCat.isEligibleForNewClients,
          requirements: dbCat.requestCategoryRequirements.map((r) => ({
            value: r.requirementId,
            label: r.requirement.name || '',
          })),
          forms: dbCat.categoryForms.map((f) => ({
            value: f.formId,
            label: f.form.name || '',
          })),
          sla: dbCat.sla
            ? {
                id: dbCat.sla.id,
                resolutionTime: dbCat.sla.resolutionTime ?? 0,
                escalationTime: dbCat.sla.escalationTime ?? 0,
              }
            : {
                id: generateUuid(),
                resolutionTime: 0,
                escalationTime: 0,
              },
          parentCategoryId: dbCat.parentCategoryId,
          children: [],
          guides: [],
          executionSteps: [],
        };

        categoryMap.set(dbCat.id, category);
      }

      // Schedule children for fetching
      if (dbCat.parentCategoryId && batchIds.includes(dbCat.parentCategoryId)) {
        categoriesToFetch.add(dbCat.id);
      }
    });
  }

  // Build parent-child relationships
  categoryMap.forEach((category) => {
    if (category.parentCategoryId) {
      const parent = categoryMap.get(category.parentCategoryId);
      if (parent) {
        parent.children.push(category.id);
      }
    }
  });

  const hierarchy = await db.requestHierarchy.findFirstOrThrow({
    select: { id: true, name: true },
    where: {
      tenantId,
      categories: { some: { id: { in: rootIds } } },
    },
  });

  return {
    categories: Array.from(categoryMap.values()),
    hierarchyId: {
      value: hierarchy.id,
      label: hierarchy.name,
    },
  };
}

/**
 * Upsert a flat array of RequestCategory objects into the database.
 * Uses BFS traversal to ensure parent-first processing.
 */
export async function upsertCategoriesFlat(categories: RequestCategoryValues[], tenantId: string, hierarchyId: string) {
  const { sortedCategories } = prepareCategoryUpsert(categories);

  await db.$transaction(
    async (tx) => {
      for (const cat of sortedCategories) {
        await tx.requestCategory.upsert(buildRequestCategoryUpsertArgs(cat, tenantId, hierarchyId));
      }
    },
    {
      maxWait: 5000,
      timeout: 20000,
    }
  );
}

/**
 * Prepares categories for upsert by:
 * 1. Creating a parent-child map
 * 2. Sorting in parent-first order using BFS
 */
function prepareCategoryUpsert(categories: RequestCategoryValues[]) {
  const categoryMap = new Map<string, RequestCategoryValues>(
    categories.map((cat) => [
      cat.id,
      {
        ...cat,
        parentCategoryId: cat.parentCategoryId || undefined,
        children: cat.children,
      },
    ])
  );

  // Find root nodes and build adjacency list
  const adjacencyList = new Map<string, string[]>();
  const reverseList = new Map<string, string>();
  const roots: string[] = [];

  for (const [id, cat] of categoryMap) {
    reverseList.set(id, cat.parentCategoryId || 'root');
    if (!cat.parentCategoryId) {
      roots.push(id);
    }
    adjacencyList.set(id, [...cat.children]);
  }

  // BFS sorting (parents before children)
  const sortedIds: string[] = [];
  const queue = [...roots];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    sortedIds.push(currentId);

    const children = adjacencyList.get(currentId) || [];
    for (const childId of children) {
      if (categoryMap.has(childId)) {
        queue.push(childId);
      }
    }
  }

  // Handle orphaned nodes (optional)
  const orphaned = Array.from(categoryMap.keys()).filter((id) => !sortedIds.includes(id));
  sortedIds.push(...orphaned);

  return {
    sortedCategories: sortedIds.map((id) => categoryMap.get(id)).filter((cat): cat is RequestCategoryValues => !!cat),
    parentChildMap: reverseList,
  };
}
