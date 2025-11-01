'use server';

import { getDb } from '@/server/db-client';

import { AssignmentCategory, AssignmentCategoryFormValues } from '@/components/common/category/assignment-category-form';

type FlatCategory = AssignmentCategory & {
  _parentId?: string;
  depth: number;
};

export async function getAssignmentCategoriesByIds(rootIds: string[], tenantId: string): Promise<AssignmentCategoryFormValues> {
  const db = await getDb();
  const categoriesToFetch = new Set(rootIds);
  const categoryMap = new Map<string, AssignmentCategory & { parentCategoryId?: string | null }>();

  while (categoriesToFetch.size > 0) {
    const batchIds = Array.from(categoriesToFetch);
    categoriesToFetch.clear();

    // Get relevant categories: those in the current batch and their direct children
    const dbCategories = await db.assignmentCategory.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        hierarchyLevelId: true,
        parentCategoryId: true,
      },
      where: {
        tenantId,
        OR: [
          { id: { in: batchIds } }, // Categories in the current batch
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
          isSubCategoryVisible: true,
          parentCategoryId: cat.parentCategoryId,
        });
      }

      // If the category is a direct child of the current batch, add its ID to fetch its children in the next iteration
      if (cat.parentCategoryId && batchIds.includes(cat.parentCategoryId)) {
        categoriesToFetch.add(cat.id);
      }
    });
  }

  // Build the category tree
  categoryMap.forEach((cat) => {
    if (cat.parentCategoryId && categoryMap.has(cat.parentCategoryId)) {
      const parent = categoryMap.get(cat.parentCategoryId);
      if (parent) {
        parent.subcategories.push(cat);
      }
    }
  });

  // Get only the root categories and build their tree
  const categories = rootIds.map((rootId) => categoryMap.get(rootId)).filter((cat) => cat !== undefined) as AssignmentCategory[];

  return { categories };
}

/**
 * Upserts a flat array of AssignmentCategory objects into the database.
 * This function processes categories from parents to children (using the depth property)
 * and performs nested upserts for categoryForms and requestCategoryRequirements.
 *
 * It also handles deletion of orphaned nested records: if a form or requirement is not
 * present in the current category data, it is deleted.
 *
 * @param categories - An array of AssignmentCategory objects arranged in a tree structure
 * @param tenantId - The tenant identifier
 * @param hierarchyId - The hierarchy identifier
 */
export async function upsertCategoriesFlat(categories: AssignmentCategory[], tenantId: string, hierarchyId: string, areaId: string) {
  const db = await getDb();
  // Flatten the category tree and sort by depth (parents first)
  const flatCategories = flattenCategories(categories).sort((a, b) => a.depth - b.depth);

  await db.$transaction(async (tx) => {
    for (const cat of flatCategories) {
      // Extract form and requirement IDs from the incoming data.
      // If the arrays are undefined, treat them as empty arrays (which will delete existing nested records).

      await tx.assignmentCategory.upsert({
        where: { id: cat.id },
        create: {
          areaId,
          tenantId,
          hierarchyId,
          id: cat.id,
          name: cat.name,
          description: cat.description,
          // For creation, isActive is derived from isSubCategoryVisible (as in the original logic)
          isActive: cat.isSubCategoryVisible,
          // Set parentCategoryId to the provided _parentId or null if there is none
          parentCategoryId: cat._parentId ? cat._parentId : null,
          hierarchyLevelId: cat.hierarchyLevelId,
        },
        update: {
          areaId,
          tenantId,
          hierarchyId,
          name: cat.name,
          description: cat.description,
          isActive: cat.isSubCategoryVisible,
          parentCategoryId: cat._parentId ? cat._parentId : null,
          hierarchyLevelId: cat.hierarchyLevelId,
        },
      });
    }
  });
}

function flattenCategories(categories: AssignmentCategory[], parentId?: string, depth: number = 0): FlatCategory[] {
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
