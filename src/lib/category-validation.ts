'use server';

import { getDb } from '@/server/db-client';

/**
 * Checks if a category can be activated (has a complete chain of children down to the last level).
 * This ensures users can complete request forms without encountering "No options" errors.
 * 
 * @param categoryId - The ID of the category to check
 * @param tenantId - The tenant ID for security
 * @returns true if the category can be activated, false otherwise
 */
export async function canActivateCategory(categoryId: string, tenantId: string): Promise<boolean> {
  const db = await getDb();

  // Fetch the category with its hierarchy and all related categories
  const category = await db.requestCategory.findUnique({
    where: { id: categoryId, tenantId },
    include: {
      hierarchyLevel: {
        include: {
          hierarchy: {
            include: {
              levels: {
                orderBy: { position: 'asc' },
              },
              categories: {
                include: {
                  hierarchyLevel: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!category) {
    return false; // Category not found
  }

  const hierarchy = category.hierarchyLevel.hierarchy;
  const allCategories = hierarchy.categories;
  const levels = hierarchy.levels;

  // If this is the last level, it's always complete (no children needed)
  const currentLevelIndex = levels.findIndex((l) => l.id === category.hierarchyLevelId);
  if (currentLevelIndex === -1) {
    return false; // Invalid level
  }

  if (currentLevelIndex === levels.length - 1) {
    return true; // Last level is always complete
  }

  // Recursive function to check if there's a complete chain from this category to the last level
  const checkChain = (cat: typeof allCategories[0], targetLevelIndex: number): boolean => {
    const catLevelIndex = levels.findIndex((l) => l.id === cat.hierarchyLevelId);
    if (catLevelIndex === -1) return false;

    // If we've reached or passed the target level, the chain is complete
    if (catLevelIndex >= targetLevelIndex) {
      return true;
    }

    // Check if this category has at least one child at the next level
    const nextLevelId = levels[catLevelIndex + 1]?.id;
    if (!nextLevelId) return false;

    const children = allCategories.filter(
      (c) => c.parentCategoryId === cat.id && c.hierarchyLevelId === nextLevelId
    );

    if (children.length === 0) {
      // No children at the next level - chain is incomplete
      return false;
    }

    // Check if at least one child has a complete chain to the target level
    return children.some((child) => checkChain(child, targetLevelIndex));
  };

  // Check if there's a complete chain from this category to the last level
  return checkChain(category, levels.length - 1);
}

