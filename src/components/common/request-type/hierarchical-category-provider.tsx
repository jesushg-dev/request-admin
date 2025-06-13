'use client';

import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { RequestLevelType } from '@/types/prisma/hierarchy';
import { OptionType } from '@/components/custom-ui/select';

import { RequestCategoryValues } from './category-form';

export interface ResourceGroup {
  levelName?: string;
  parentLabel: string;
  resources: OptionType[];
  hierarchyLevelId: string;
}

export interface BlockedResourceCategory {
  level: RequestLevelType;
  parentLabel: string;
  groupId: string;
}

export interface BlockedResource {
  resource: OptionType;
  categories: BlockedResourceCategory[];
}

type OptionArrayKeys<T> = {
  [K in keyof T]: T[K] extends OptionType[] | undefined ? K : never;
}[keyof T];

type ResourceFieldType = OptionArrayKeys<RequestCategoryValues>;

export interface HierarchicalResourceContextValue {
  categories: RequestCategoryValues[];
  getInheritedGroups: (currentCategoryId: string, resourceField: ResourceFieldType, levels: RequestLevelType[]) => ResourceGroup[];
  getChildGroups: (currentCategoryId: string, resourceField: ResourceFieldType, levels: RequestLevelType[]) => BlockedResource[];
  getSelectableResources: (currentResources: OptionType[], inheritedGroups: { resources: OptionType[] }[], childGroups: { resource: OptionType }[]) => OptionType[];
  promoteResource: (currentCategoryId: string, resourceField: ResourceFieldType, resource: OptionType) => void;
  setCategories: React.Dispatch<React.SetStateAction<RequestCategoryValues[]>>;
}

export interface HierarchicalResourceProviderProps {
  children: ReactNode;
  initialCategories?: RequestCategoryValues[];
}

const HierarchicalResourceContext = createContext<HierarchicalResourceContextValue | undefined>(undefined);

export const HierarchicalResourceProvider: React.FC<HierarchicalResourceProviderProps> = ({ children, initialCategories = [] }) => {
  const [categories, setCategories] = useState<RequestCategoryValues[]>(initialCategories);

  const getDescendantIds = useCallback(
    (categoryId: string): string[] => {
      const category = categories.find((c) => c.id === categoryId);
      if (!category || !category.children || category.children.length === 0) return [];

      const descendants: string[] = [];
      const queue = [...category.children];

      while (queue.length > 0) {
        const childId = queue.shift()!;
        descendants.push(childId);
        const childCategory = categories.find((c) => c.id === childId);
        if (childCategory?.children) {
          queue.push(...childCategory.children);
        }
      }
      return descendants;
    },
    [categories]
  );

  const getInheritedGroups = useCallback(
    (currentCategoryId: string, resourceField: ResourceFieldType, levels: RequestLevelType[]) => {
      if (!currentCategoryId || categories.length === 0) return [];

      const groups: ResourceGroup[] = [];
      let current = categories.find((c) => c.id === currentCategoryId);

      while (current && current.parentCategoryId) {
        const parent = categories.find((c) => c.id === current!.parentCategoryId);
        let resources: OptionType[] | undefined = undefined;
        if (parent && resourceField) {
          resources = parent[resourceField] as OptionType[] | undefined;
        }

        if (parent && resources && resources.length) {
          const levelName = levels.find((l) => l.id === parent.hierarchyLevelId)?.name || 'N/A';
          groups.push({
            parentLabel: parent.name,
            resources,
            hierarchyLevelId: parent.hierarchyLevelId,
            levelName,
          });
        }
        current = parent;
      }
      return groups.reverse();
    },
    [categories]
  );

  const getChildGroups = useCallback(
    (currentCategoryId: string, resourceField: ResourceFieldType, levels: RequestLevelType[]) => {
      if (!currentCategoryId || categories.length === 0) return [];

      const currentCategory = categories.find((c) => c.id === currentCategoryId);
      if (!currentCategory || !currentCategory.children || currentCategory.children.length === 0) return [];

      const resourceMap: Record<
        string | number,
        {
          resource: OptionType;
          categories: { level: RequestLevelType; parentLabel: string; groupId: string }[];
        }
      > = {};

      const processChildren = (categoryId: string) => {
        const childCategory = categories.find((c) => c.id === categoryId);
        let resources: OptionType[] | undefined = undefined;
        if (childCategory && resourceField) {
          resources = childCategory[resourceField] as OptionType[] | undefined;
        }

        if (childCategory && resources && resources.length) {
          const level = levels.find((l) => l.id === childCategory.hierarchyLevelId) || {
            id: 'unknown',
            name: 'N/A',
            position: 0,
          };

          resources.forEach((resource) => {
            const resourceKey = String(resource.value);

            if (!resourceMap[resourceKey]) {
              resourceMap[resourceKey] = {
                resource,
                categories: [],
              };
            }

            resourceMap[resourceKey].categories.push({
              level,
              parentLabel: childCategory.name,
              groupId: childCategory.hierarchyLevelId,
            });
          });
        }

        if (childCategory?.children && childCategory.children.length > 0) {
          childCategory.children.forEach(processChildren);
        }
      };

      currentCategory.children.forEach(processChildren);

      return Object.values(resourceMap);
    },
    [categories]
  );

  const getSelectableResources = useCallback((currentResources: OptionType[], inheritedGroups: { resources: OptionType[] }[], childGroups: { resource: OptionType }[]) => {
    const inheritedValues = new Set(inheritedGroups.flatMap((group) => group.resources.map((r) => r.value)));
    const blockedValues = new Set(childGroups.map((group) => group.resource.value));
    return currentResources.filter((r) => !inheritedValues.has(r.value) && !blockedValues.has(r.value));
  }, []);

  const promoteResource = useCallback(
    (currentCategoryId: string, resourceField: ResourceFieldType, resource: OptionType) => {
      // 1. Remove the resource from all descendants
      const descendantIds = getDescendantIds(currentCategoryId);
      const updatedCategories = [...categories].map((category) => {
        if (descendantIds.includes(category.id) && resourceField) {
          const currentResources = (category[resourceField] as OptionType[] | undefined) || [];
          const newResources = currentResources.filter((r) => r.value !== resource.value);
          return { ...category, [resourceField]: newResources };
        }
        return category;
      });

      // 2. Add the resource to the current category
      const currentCategoryIndex = updatedCategories.findIndex((c) => c.id === currentCategoryId);
      if (currentCategoryIndex !== -1 && resourceField) {
        const currentCategory = updatedCategories[currentCategoryIndex];
        const currentResources = (currentCategory[resourceField] as OptionType[] | undefined) || [];

        // Only add if it does not exist
        if (!currentResources.some((r) => r.value === resource.value)) {
          updatedCategories[currentCategoryIndex] = {
            ...currentCategory,
            [resourceField]: [...currentResources, resource],
          };
        }
      }

      // 3. Update the global state
      setCategories(updatedCategories);
    },
    [categories, getDescendantIds]
  );

  const value: HierarchicalResourceContextValue = useMemo(
    () => ({
      categories,
      setCategories,
      getInheritedGroups,
      getChildGroups,
      getSelectableResources,
      promoteResource,
    }),
    [categories, getInheritedGroups, getChildGroups, getSelectableResources, promoteResource]
  );

  return <HierarchicalResourceContext.Provider value={value}>{children}</HierarchicalResourceContext.Provider>;
};

export const useHierarchicalResourceContext = () => {
  const context = useContext(HierarchicalResourceContext);
  if (!context) {
    throw new Error('useHierarchicalResourceContext must be used within HierarchicalResourceProvider');
  }
  return context;
};
