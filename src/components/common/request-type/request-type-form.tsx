'use client';

import { FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from 'react';
import { createExecutionFlow } from '@/actions/execution-flow';
import { upsertRequestCategory } from '@/actions/request-type';
import { useUpsertRequestCategory } from '@/services/api/hooks';
import { useRequestCategorySchema } from '@/services/schemas/request-type';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom, useAtomValue } from 'jotai';
import { BookCopyIcon, BookIcon, ChevronLeft, ChevronRight, ContainerIcon, FileCogIcon, FileStackIcon, PackageOpenIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { toast } from 'sonner';

import { RequestHierarchyWithLevelsType, RequestLevelType } from '@/types/zenstackhq/hierarchy';
import { IncompleteCategoryChainError } from '@/lib/errors';
import { buildRequestCategoryUpsertArgs } from '@/lib/request-type';
import { Form } from '@/components/ui/form';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { OptionType } from '@/components/custom-ui/select';
import { FormError, FormRoot } from '@/components/shared/form-root';

import { CategoryForm, getDefaultCategory, RequestCategoryValues } from './category-form';
import { CategoryTreeView } from './category-tree-view';
import { HierarchyDiagram } from './hierarchy-diagram';
import {
  addCreatingCategoryAtom,
  categoriesAtom,
  convertCreatingToRealAtom,
  creatingCategoriesAtom,
  removeCreatingCategoryAtom,
  selectedCategoryIdAtom,
  upsertCategoryAtom,
} from './store/category-store';

type Mode = 'add' | 'edit' | 'none';

export interface RequestTypeFormValues {
  hierarchyId: OptionType;
  categories: RequestCategoryValues[];
}

interface RequestTypeFormProps {
  tenantId: string;
  forms: OptionType[];
  requirements: OptionType[];
  requestHierarchy: RequestHierarchyWithLevelsType;
  initialValues: RequestTypeFormValues;
}

const RequestTypeForm: FC<RequestTypeFormProps> = ({ initialValues, requirements, forms, requestHierarchy, tenantId }) => {
  const t = useTranslations('admin.requestType.create');

  const ref = useRef<ImperativePanelHandle>(null);
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error, reset: resetError } = useUpsertRequestCategory();
  const requestCategorySchema = useRequestCategorySchema();

  const [mode, setMode] = useState<Mode>('none');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Use Jotai for global category state
  const [categories, setCategories] = useAtom(categoriesAtom);
  const creatingCategories = useAtomValue(creatingCategoriesAtom);
  const [, upsertCategory] = useAtom(upsertCategoryAtom);
  const [, addCreatingCategory] = useAtom(addCreatingCategoryAtom);
  const [, removeCreatingCategory] = useAtom(removeCreatingCategoryAtom);
  const [, convertCreatingToReal] = useAtom(convertCreatingToRealAtom);
  const [, setSelectedCategoryId] = useAtom(selectedCategoryIdAtom);

  // Initialize categories atom with initial values
  useLayoutEffect(() => {
    if (initialValues.categories.length > 0) {
      setCategories(initialValues.categories);
    }
  }, [initialValues.categories.length, setCategories]);

  // Update when initialValues change (after initial load)
  useEffect(() => {
    if (initialValues.categories.length > 0) {
      setCategories(initialValues.categories);
    }
  }, [initialValues.categories, setCategories]);

  const form = useForm({
    resolver: zodResolver(requestCategorySchema),
  });

  const formsOptions = useMemo(() => forms, [forms]);
  const requirementsOptions = useMemo(() => requirements, [requirements]);

  // Create a dictionary for quick level lookup by ID
  const levelsMap = useMemo(() => {
    const map = new Map<string, { level: RequestLevelType; index: number }>();
    requestHierarchy.levels.forEach((level, index) => {
      map.set(level.id, { level, index });
    });
    return map;
  }, [requestHierarchy.levels]);

  // Validate that all hierarchy levels are complete (no gaps)
  // This ensures that if a category is at level N, all levels from 1 to N-1 must exist in its ancestor chain
  const validateCompleteHierarchy = useCallback(
    (category: RequestCategoryValues): { isValid: boolean; missingLevel?: number } => {
      const allCategories = [...categories, ...Array.from(creatingCategories.values())];

      // If this is a root category (level 1, index 0), it's always valid
      const currentLevelInfo = levelsMap.get(category.hierarchyLevelId);
      if (!currentLevelInfo || currentLevelInfo.index === 0) {
        return { isValid: true };
      }

      // Build the ancestor chain by traversing up the parent chain
      const ancestorChain: RequestCategoryValues[] = [];
      let currentCategory: RequestCategoryValues | undefined = category;

      // Traverse up the parent chain until we reach the root
      while (currentCategory?.parentCategoryId) {
        const parent = allCategories.find((c) => c.id === currentCategory?.parentCategoryId);
        if (!parent) {
          // Parent not found - invalid state
          return { isValid: false, missingLevel: currentLevelInfo.index };
        }
        ancestorChain.push(parent);
        currentCategory = parent;
      }

      // Verify that all levels from 0 (root) to currentLevelInfo.index - 1 are present in the chain
      // The chain should have exactly currentLevelInfo.index ancestors, one for each level
      for (let i = 0; i < currentLevelInfo.index; i++) {
        const expectedLevelId = requestHierarchy.levels[i]?.id;
        if (!expectedLevelId) continue;

        // Check if we have a category at this level in the ancestor chain
        const hasLevel = ancestorChain.some((ancestor) => ancestor.hierarchyLevelId === expectedLevelId);

        if (!hasLevel) {
          // Missing level in the chain - return the level number (1-based) for the error message
          return { isValid: false, missingLevel: i };
        }
      }

      // Also verify that the parent is at the immediately previous level
      if (category.parentCategoryId) {
        const parent = allCategories.find((c) => c.id === category.parentCategoryId);
        if (parent) {
          const parentLevelInfo = levelsMap.get(parent.hierarchyLevelId);
          if (parentLevelInfo && parentLevelInfo.index !== currentLevelInfo.index - 1) {
            // Parent is not at the immediately previous level - there's a gap
            return { isValid: false, missingLevel: currentLevelInfo.index - 1 };
          }
        }
      }

      return { isValid: true };
    },
    [categories, creatingCategories, levelsMap, requestHierarchy.levels]
  );

  // Validate that a category has a complete chain of children down to the last level
  // This ensures that when creating a request, all levels can be selected
  const hasCompleteChildrenChain = useCallback(
    (category: RequestCategoryValues): boolean => {
      const allCategories = [...categories, ...Array.from(creatingCategories.values())];
      const currentLevelInfo = levelsMap.get(category.hierarchyLevelId);

      if (!currentLevelInfo) return false;

      // If this is the last level, it's always valid (no children needed)
      if (currentLevelInfo.index === requestHierarchy.levels.length - 1) {
        return true;
      }

      // Recursive function to check if there's a complete chain from this category to the last level
      const checkChain = (cat: RequestCategoryValues, targetLevelIndex: number): boolean => {
        // If we've reached the target level, the chain is complete
        const catLevelInfo = levelsMap.get(cat.hierarchyLevelId);
        if (!catLevelInfo) return false;

        if (catLevelInfo.index >= targetLevelIndex) {
          return true;
        }

        // Check if this category has at least one child at the next level
        const nextLevelId = requestHierarchy.levels[catLevelInfo.index + 1]?.id;
        if (!nextLevelId) return false;

        const children = allCategories.filter((c) => c.parentCategoryId === cat.id && c.hierarchyLevelId === nextLevelId);

        if (children.length === 0) {
          // No children at the next level - chain is incomplete
          return false;
        }

        // Check if at least one child has a complete chain to the target level
        return children.some((child) => checkChain(child, targetLevelIndex));
      };

      // Check if there's a complete chain from this category to the last level
      return checkChain(category, requestHierarchy.levels.length - 1);
    },
    [categories, creatingCategories, levelsMap, requestHierarchy.levels]
  );

  const toggleSidebar = () => {
    if (ref.current) {
      const newSize = ref.current.isCollapsed() ? 30 : 0;
      setIsSidebarCollapsed(!isSidebarCollapsed);
      ref.current.resize(newSize);
    }
  };

  const handleAddCategory = useCallback(
    (hierarchyLevelId: string, parentCategoryId?: string | null) => {
      const firstLevelId = requestHierarchy.levels[0]?.id;
      const levelInfo = levelsMap.get(hierarchyLevelId);

      // Validate that first level categories cannot have a parent
      if (hierarchyLevelId === firstLevelId && parentCategoryId) {
        toast.error(t('category.errors.firstLevelNoParent'));
        return;
      }

      // Validate that subcategories can only be added if there's a next level
      if (parentCategoryId && (!levelInfo || levelInfo.index === -1)) {
        toast.error(t('category.errors.invalidLevel'));
        return;
      }

      // Validate that only one root category (level 0, no parent) can exist
      if (hierarchyLevelId === firstLevelId && !parentCategoryId) {
        const existingRootCategory = categories.find((cat) => !cat.parentCategoryId && cat.hierarchyLevelId === firstLevelId);
        if (existingRootCategory) {
          toast.error(t('category.errors.onlyOneRootAllowed'));
          return;
        }
      }

      // Create temporary category for "creating" state
      const tempCategory = getDefaultCategory(hierarchyLevelId, parentCategoryId);
      addCreatingCategory(tempCategory);

      // If has parent, add to parent's children array temporarily
      if (parentCategoryId) {
        const parent = categories.find((c) => c.id === parentCategoryId);
        if (parent) {
          const updatedParent = {
            ...parent,
            children: [...(parent.children || []), tempCategory.id],
          };
          upsertCategory(updatedParent);
        }
      }

      // Select the newly created category
      setSelectedCategoryId(tempCategory.id);

      setMode('add');
      form.reset(tempCategory);
    },
    [form, requestHierarchy, levelsMap, categories, t, addCreatingCategory, upsertCategory, setSelectedCategoryId]
  );

  const handleEditCategory = useCallback(
    (category: RequestCategoryValues) => {
      setMode('edit');
      form.reset(category);
    },
    [form]
  );

  const handleCancelForm = useCallback(() => {
    const currentCategory = form.getValues();

    // Only remove temporary category if it's actually a creating category (not an edit)
    const isCreatingCategory = creatingCategories.has(currentCategory.id);

    if (isCreatingCategory && currentCategory.id) {
      removeCreatingCategory(currentCategory.id);

      // Remove from parent's children if it has a parent
      if (currentCategory.parentCategoryId) {
        const parent = categories.find((c) => c.id === currentCategory.parentCategoryId);
        if (parent) {
          const updatedParent = {
            ...parent,
            children: (parent.children || []).filter((id) => id !== currentCategory.id),
          };
          upsertCategory(updatedParent);
        }
      }
    }

    setMode('none');
    const defaultLevelId = requestHierarchy.levels[0]?.id ?? '';
    form.reset(getDefaultCategory(defaultLevelId));
    resetError();
    // Deselect category in tree
    setSelectedCategoryId(null);
  }, [form, resetError, requestHierarchy, removeCreatingCategory, categories, upsertCategory, creatingCategories, setSelectedCategoryId]);

  const onSubmit = (cat: RequestCategoryValues) => {
    if (!initialValues.hierarchyId.value) return;

    const firstLevelId = requestHierarchy.levels[0]?.id;
    const levelInfo = levelsMap.get(cat.hierarchyLevelId);

    // Validate that no duplicates exist (same name, same level, same parent)
    // Check both real categories and creating categories
    const allCategories = [...categories, ...Array.from(creatingCategories.values())];
    const duplicate = allCategories.find(
      (c) =>
        c.id !== cat.id &&
        c.name.toLowerCase().trim() === cat.name.toLowerCase().trim() &&
        c.hierarchyLevelId === cat.hierarchyLevelId &&
        (c.parentCategoryId || null) === (cat.parentCategoryId || null)
    );

    if (duplicate) {
      toast.error(t('category.errors.duplicateName'));
      return;
    }

    // Validate that category name is not the same as parent name
    if (cat.parentCategoryId) {
      const parent = allCategories.find((c) => c.id === cat.parentCategoryId);
      if (parent && parent.name.toLowerCase().trim() === cat.name.toLowerCase().trim()) {
        toast.error(t('category.errors.sameNameAsParent'));
        return;
      }
    }

    // Validate that first level categories cannot have a parent
    if (cat.hierarchyLevelId === firstLevelId && cat.parentCategoryId) {
      toast.error(t('category.errors.firstLevelNoParent'));
      return;
    }

    // Validate that only one root category (level 0, no parent) can exist
    if (cat.hierarchyLevelId === firstLevelId && !cat.parentCategoryId) {
      const existingRootCategory = categories.find((c) => c.id !== cat.id && !c.parentCategoryId && c.hierarchyLevelId === firstLevelId);
      if (existingRootCategory) {
        toast.error(t('category.errors.onlyOneRootAllowed'));
        return;
      }
    }

    // Validate that all hierarchy levels are complete (no gaps in the chain)
    const hierarchyValidation = validateCompleteHierarchy(cat);
    if (!hierarchyValidation.isValid) {
      const missingLevelIndex = hierarchyValidation.missingLevel ?? 0;
      const missingLevel = requestHierarchy.levels[missingLevelIndex];
      const missingLevelName = missingLevel?.name || `Nivel ${missingLevelIndex + 1}`;
      toast.error(t('category.errors.incompleteHierarchy', { levelName: missingLevelName }));
      return;
    }

    // Note: We no longer block creation when parent has incomplete children chain
    // Instead, we show visual warnings in the UI to guide users

    startTransition(async () => {
      try {
        const previousCategory = categories.find((c) => c.id === cat.id);

        const toastId = toast.loading(t('category.loading'));

        // Use server action with validation when activating, otherwise use the hook
        if (cat.isActive) {
          // Check if category is being activated (new active category or changing from inactive to active)
          const isActivating = !previousCategory || !previousCategory.isActive;

          if (isActivating) {
            // Validate in client first (using local state) before calling server
            const canActivate = hasCompleteChildrenChain(cat);
            if (!canActivate) {
              toast.error(t('category.errors.cannotActivateIncomplete', { categoryName: cat.name }));
              return;
            }
          }

          // Use server action for validation
          await upsertRequestCategory(cat, tenantId, String(initialValues.hierarchyId.value));
        } else {
          // Use hook for non-activating updates (faster, no validation needed)
          await upsert(buildRequestCategoryUpsertArgs(cat, tenantId, String(initialValues.hierarchyId.value)));
        }

        // Handle execution flow if needed
        if (cat.executionSteps) {
          toast.loading(t('category.executionLoading'), { id: toastId });
          await createExecutionFlow(cat.executionSteps, cat.id, tenantId);
        }

        toast.success(t('category.success'), { id: toastId });

        // If this was a creating category, convert it to real
        if (!previousCategory) {
          convertCreatingToReal(cat.id);
        }

        // Update Jotai atom
        setCategories((prev) => {
          const prevCategories = [...prev];

          // Remove from old parent if parent changed
          if (previousCategory?.parentCategoryId && previousCategory.parentCategoryId !== cat.parentCategoryId) {
            const oldParent = prevCategories.find((c) => c.id === previousCategory.parentCategoryId);
            if (oldParent) {
              oldParent.children = oldParent.children.filter((id) => id !== cat.id);
            }
          }

          const categoryIndex = prevCategories.findIndex((c) => c.id === cat.id);
          const isNewCategory = categoryIndex === -1;

          if (isNewCategory) {
            prevCategories.push({
              ...cat,
              children: cat.children || [],
            });
          } else {
            prevCategories[categoryIndex] = {
              ...prevCategories[categoryIndex],
              ...cat,
            };
          }

          // Add to new parent if has parent
          if (cat.parentCategoryId) {
            const newParent = prevCategories.find((c) => c.id === cat.parentCategoryId);
            if (newParent && !newParent.children.includes(cat.id)) {
              newParent.children = [...newParent.children, cat.id];
            }
          }

          return prevCategories;
        });

        // Close form after successful save
        setMode('none');
        const defaultLevelId = requestHierarchy.levels[0]?.id ?? '';
        form.reset(getDefaultCategory(defaultLevelId));
        // Deselect category in tree
        setSelectedCategoryId(null);
      } catch (error) {
        // Handle IncompleteCategoryChainError with a specific message
        if (error instanceof IncompleteCategoryChainError) {
          toast.error(t('category.errors.cannotActivateIncomplete', { categoryName: error.categoryName }));
        } else {
          const errorMessage = typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error);
          toast.error(t('category.error', { error: errorMessage }));
        }
      }
    });
  };

  const isFormActive = mode !== 'none';

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={30} collapsible ref={ref} minSize={0}>
        <div className="flex flex-col h-full overflow-hidden">
          <CategoryTreeView
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            hierarchy={requestHierarchy}
            tenantId={tenantId}
            hierarchyId={String(initialValues.hierarchyId.value)}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle />

      <ResizablePanel className="flex-1 relative" defaultSize={70}>
        <div className="flex items-center justify-center h-full p-4 overflow-hidden">
          <button type="button" onClick={toggleSidebar} className="absolute top-1/2 -left-2 -translate-y-1/2 p-2 rounded-lg hover:bg-accent transition-colors z-10">
            {isSidebarCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {isFormActive ? (
            <Form {...form}>
              <FormRoot className="h-full" onSubmit={form.handleSubmit(onSubmit)}>
                <FormError error={error} />
                <CategoryForm
                  mode={mode}
                  isPending={isPending}
                  formsOptions={formsOptions}
                  levels={requestHierarchy.levels}
                  requirementsOptions={requirementsOptions}
                  handleCancelForm={handleCancelForm}
                  hierarchy={requestHierarchy}
                />
              </FormRoot>
            </Form>
          ) : (
            <HierarchyDiagram hierarchy={requestHierarchy} />
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default RequestTypeForm;
