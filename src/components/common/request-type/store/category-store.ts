import { atom } from 'jotai';

import { RequestLevelType } from '@/types/zenstackhq/hierarchy';
import { OptionType } from '@/components/custom-ui/select';

import { RequestCategoryValues } from '../category-form';
import { BlockedResource, ResourceGroup } from '../types';

// Base atom for all categories
export const categoriesAtom = atom<RequestCategoryValues[]>([]);

// Atom for temporary categories being created (not yet saved to DB)
export const creatingCategoriesAtom = atom<Map<string, RequestCategoryValues>>(new Map());

// Atom for selected category ID
export const selectedCategoryIdAtom = atom<string | null>(null);

// Helper function to find category by ID
const findCategoryById = (categories: RequestCategoryValues[], id: string): RequestCategoryValues | undefined => {
  return categories.find((c) => c.id === id);
};

// Helper function to get all descendant IDs
const getDescendantIds = (categories: RequestCategoryValues[], parentId: string): string[] => {
  const descendants: string[] = [];
  const parent = findCategoryById(categories, parentId);
  if (parent?.children) {
    parent.children.forEach((childId) => {
      descendants.push(childId);
      descendants.push(...getDescendantIds(categories, childId));
    });
  }
  return descendants;
};

// Derived atom to get inherited groups (resources from parent categories)
export const getInheritedGroupsAtom = atom((get) => (categoryId: string, resourceType: 'requirements' | 'forms', levels: RequestLevelType[]): ResourceGroup[] => {
  const categories = get(categoriesAtom);
  const category = findCategoryById(categories, categoryId);
  if (!category) return [];

  const groups: ResourceGroup[] = [];
  let currentCategory: RequestCategoryValues | undefined = category;

  // Traverse up the hierarchy
  while (currentCategory?.parentCategoryId) {
    const parent = findCategoryById(categories, currentCategory.parentCategoryId);
    if (!parent) break;

    const level = levels.find((l) => l.id === parent.hierarchyLevelId);
    if (level) {
      const resources = resourceType === 'requirements' ? parent.requirements : parent.forms;
      if (resources && resources.length > 0) {
        groups.push({
          level,
          resources,
          levelName: level.name,
          parentLabel: parent.name,
          hierarchyLevelId: parent.hierarchyLevelId,
        });
      }
    }

    currentCategory = parent;
  }

  // Reverse to show from top to bottom
  return groups.reverse();
});

// Derived atom to get child groups (blocked resources from child categories)
export const getChildGroupsAtom = atom((get) => (categoryId: string, resourceType: 'requirements' | 'forms', levels: RequestLevelType[]): BlockedResource[] => {
  const categories = get(categoriesAtom);
  const category = findCategoryById(categories, categoryId);
  if (!category) return [];

  // Group resources by resource value
  const resourceMap = new Map<string, { resource: OptionType; categories: Array<{ level: RequestLevelType; parentLabel: string; groupId: string }> }>();
  const childIds = category.children || [];

  childIds.forEach((childId) => {
    const child = findCategoryById(categories, childId);
    if (!child) return;

    const level = levels.find((l) => l.id === child.hierarchyLevelId);
    if (level) {
      const resources = resourceType === 'requirements' ? child.requirements : child.forms;
      if (resources && resources.length > 0) {
        resources.forEach((resource) => {
          if (!resourceMap.has(String(resource.value))) {
            resourceMap.set(String(resource.value), {
              resource,
              categories: [],
            });
          }
          const entry = resourceMap.get(String(resource.value))!;
          entry.categories.push({
            level,
            parentLabel: child.name,
            groupId: child.hierarchyLevelId,
          });
        });
      }
    }
  });

  return Array.from(resourceMap.values());
});

// Action atom to update categories
export const updateCategoriesAtom = atom(null, (get, set, updater: (prev: RequestCategoryValues[]) => RequestCategoryValues[]) => {
  const current = get(categoriesAtom);
  set(categoriesAtom, updater(current));
});

// Action atom to upsert a category (add or update)
export const upsertCategoryAtom = atom(null, (get, set, category: RequestCategoryValues) => {
  const current = get(categoriesAtom);
  const index = current.findIndex((c) => c.id === category.id);

  if (index >= 0) {
    // Update existing
    const updated = [...current];
    updated[index] = category;
    set(categoriesAtom, updated);
  } else {
    // Add new
    set(categoriesAtom, [...current, category]);
  }
});

// Action atom to add a temporary category (being created)
export const addCreatingCategoryAtom = atom(null, (get, set, category: RequestCategoryValues) => {
  const current = get(creatingCategoriesAtom);
  const updated = new Map(current);
  updated.set(category.id, category);
  set(creatingCategoriesAtom, updated);
});

// Action atom to remove a temporary category (cancelled)
export const removeCreatingCategoryAtom = atom(null, (get, set, categoryId: string) => {
  const current = get(creatingCategoriesAtom);
  const updated = new Map(current);
  updated.delete(categoryId);
  set(creatingCategoriesAtom, updated);
});

// Action atom to convert temporary category to real (on save)
export const convertCreatingToRealAtom = atom(null, (get, set, categoryId: string) => {
  const creating = get(creatingCategoriesAtom);
  const category = creating.get(categoryId);
  if (!category) return;

  // Remove from creating
  const updatedCreating = new Map(creating);
  updatedCreating.delete(categoryId);
  set(creatingCategoriesAtom, updatedCreating);

  // Add to real categories (the category is already added via setCategories in onSubmit)
  // This atom just removes it from creating state
});

// Action atom to promote a resource from child to current category
export const promoteResourceAtom = atom(null, (get, set, categoryId: string, resourceType: 'requirements' | 'forms', resource: OptionType) => {
  const categories = get(categoriesAtom);
  const category = findCategoryById(categories, categoryId);
  if (!category) return;

  const updatedCategory = { ...category };
  const currentResources = resourceType === 'requirements' ? updatedCategory.requirements : updatedCategory.forms;
  const updatedResources = [...(currentResources || []), resource];

  if (resourceType === 'requirements') {
    updatedCategory.requirements = updatedResources;
  } else {
    updatedCategory.forms = updatedResources;
  }

  // Remove from all children
  const removeFromChildren = (parentId: string) => {
    const parent = findCategoryById(categories, parentId);
    if (!parent?.children) return;

    parent.children.forEach((childId) => {
      const child = findCategoryById(categories, childId);
      if (child) {
        const childResources = resourceType === 'requirements' ? child.requirements : child.forms;
        const filteredResources = (childResources || []).filter((r) => r.value !== resource.value);

        if (resourceType === 'requirements') {
          child.requirements = filteredResources;
        } else {
          child.forms = filteredResources;
        }

        // Recursively remove from grandchildren
        removeFromChildren(childId);
      }
    });
  };

  removeFromChildren(categoryId);

  // Update the category in the array
  const updatedCategories = categories.map((c) => (c.id === categoryId ? updatedCategory : c));
  set(categoriesAtom, updatedCategories);
});
