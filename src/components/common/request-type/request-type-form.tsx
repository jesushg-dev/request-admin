'use client';

import { FC, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { createExecutionFlow } from '@/actions/execution-flow';
import { useUpsertRequestCategory } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookCopyIcon, BookIcon, ChevronLeft, ChevronRight, ContainerIcon, FileCogIcon, FileStackIcon, PackageOpenIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { toast } from 'sonner';

import { RequestHierarchyWithLevelsType } from '@/types/zenstackhq/hierarchy';
import { buildRequestCategoryUpsertArgs } from '@/lib/request-type';
import { Form } from '@/components/ui/form';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { OptionType } from '@/components/custom-ui/select';
import EmptyState from '@/components/shared/empty-state';
import { FormError, FormRoot } from '@/components/shared/form-root';
import { useRequestCategorySchema } from '@/services/schemas/request-type';

import { CategoryForm, getDefaultCategory, RequestCategoryValues } from './category-form';
import { CategoryTreeView } from './category-tree-view';

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
  const [currentState, setCurrentState] = useState<RequestTypeFormValues['categories']>(initialValues.categories);

  const form = useForm({
    resolver: zodResolver(requestCategorySchema),
  });

  const formsOptions = useMemo(() => forms, [forms]);
  const requirementsOptions = useMemo(() => requirements, [requirements]);

  const toggleSidebar = () => {
    if (ref.current) {
      const newSize = ref.current.isCollapsed() ? 30 : 0;
      setIsSidebarCollapsed(!isSidebarCollapsed);
      ref.current.resize(newSize);
    }
  };

  const handleAddCategory = useCallback(
    (hierarchyLevelId: string, parentCategoryId?: string | null) => {
      setMode('add');
      form.reset(getDefaultCategory(hierarchyLevelId, parentCategoryId));
    },
    [form]
  );

  const handleEditCategory = useCallback(
    (category: RequestCategoryValues) => {
      setMode('edit');
      form.reset(category);
    },
    [form]
  );

  const handleCancelForm = useCallback(() => {
    setMode('none');
    const defaultLevelId = requestHierarchy.levels[0]?.id ?? '';
    form.reset(getDefaultCategory(defaultLevelId));
    resetError();
  }, [form, resetError, requestHierarchy]);

  const onSubmit = (cat: RequestCategoryValues) => {
    if (!initialValues.hierarchyId.value) return;

    startTransition(async () => {
      try {
        const previousState = currentState?.find((c) => c.id === cat.id);

        const toastId = toast.loading(t('category.loading'));

        const response = await upsert(buildRequestCategoryUpsertArgs(cat, tenantId, String(initialValues.hierarchyId.value)));
        if (cat.executionSteps && response) {
          toast.loading(t('category.executionLoading'), { id: toastId });
          await createExecutionFlow(cat.executionSteps, cat.id, tenantId);
        }

        toast.success(t('category.success'), { id: toastId });

        setCurrentState((prev) => {
          const prevCategories = [...prev];
          if (previousState) {
            const previousParent = prevCategories.find((c) => c.id === previousState.parentCategoryId);
            if (previousParent) {
              previousParent.children = previousParent.children.filter((id) => id !== cat.id);
            }
          }

          const categoryIndex = prevCategories.findIndex((c) => c.id === cat.id);
          const isNewCategory = categoryIndex === -1;

          if (isNewCategory) {
            prevCategories.push({
              ...cat,
              children: [],
            });
          } else {
            prevCategories[categoryIndex] = {
              ...prevCategories[categoryIndex],
              ...cat,
            };
          }

          if (cat.parentCategoryId) {
            const newParent = prevCategories.find((c) => c.id === cat.parentCategoryId);
            if (newParent && !newParent.children.includes(cat.id)) {
              newParent.children = [...newParent.children, cat.id];
            }
          }

          return prevCategories;
        });
      } catch (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error);
        toast.error(t('category.error', { error: errorMessage }));
      }
    });
  };

  useEffect(() => {
    setCurrentState(initialValues.categories);
  }, [initialValues.categories]);

  const isFormActive = mode !== 'none';

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={30} collapsible ref={ref} minSize={0}>
        <div className="flex flex-col h-full overflow-hidden">
          <CategoryTreeView categories={currentState} onAddCategory={handleAddCategory} onEditCategory={handleEditCategory} hierarchy={requestHierarchy} />
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
                  currentState={currentState}
                  levels={requestHierarchy.levels}
                  requirementsOptions={requirementsOptions}
                  handleCancelForm={handleCancelForm}
                />
              </FormRoot>
            </Form>
          ) : (
            <EmptyState
              title={t('manageTitle')}
              description={t('manageDescription')}
              icons={[FileStackIcon, BookCopyIcon, ContainerIcon]}
            />
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default RequestTypeForm;
