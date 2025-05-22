'use client';

import { FC, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { upsertExecutionFlow } from '@/actions/execution-flow';
import { useUpsertRequestCategory } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookCopyIcon, BookIcon, ChevronLeft, ChevronRight, ContainerIcon, FileCogIcon, FileStackIcon, PackageOpenIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { SingleValue } from 'react-select';
import { toast } from 'sonner';

import { RequestHierarchyWithLevelsType } from '@/types/prisma/hierarchy';
import { buildRequestCategoryUpsertArgs } from '@/lib/request-type';
import { Form } from '@/components/ui/form';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Select, { OptionType } from '@/components/custom-ui/select';
import EmptyState from '@/components/shared/empty-state';
import { FormError, FormRoot } from '@/components/shared/form-root';

import { CategoryForm, getDefaultCategory, requestCategorySchema, RequestCategoryValues } from './category-form';
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
  requestHierarchies: RequestHierarchyWithLevelsType[];
  initialValues?: RequestTypeFormValues | null;
  disableHierarchyChange?: boolean;
}

const RequestTypeForm: FC<RequestTypeFormProps> = ({ initialValues, requirements, forms, requestHierarchies, tenantId, disableHierarchyChange = false }) => {
  const t = useTranslations('admin.requestType.create');

  const ref = useRef<ImperativePanelHandle>(null);
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error, reset: resetError } = useUpsertRequestCategory();

  const [mode, setMode] = useState<Mode>('none');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [selectedHierarchy, setSelectedHierarchy] = useState<SingleValue<OptionType>>();
  const [currentState, setCurrentState] = useState<RequestTypeFormValues['categories']>([]);

  const form = useForm({
    resolver: zodResolver(requestCategorySchema),
  });

  const hierarchyOptions = useMemo(() => requestHierarchies.map((h) => ({ label: h.name, value: h.id })), [requestHierarchies]);

  const selectedHierarchyData = useMemo(() => requestHierarchies.find((h) => h.id === selectedHierarchy?.value), [requestHierarchies, selectedHierarchy]);

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
    const defaultLevelId = selectedHierarchyData?.levels[0].id ?? '';
    form.reset(getDefaultCategory(defaultLevelId));
    resetError();
  }, [form, resetError, selectedHierarchyData]);

  const handleHierarchyChange = useCallback((newValue: SingleValue<OptionType>) => setSelectedHierarchy(newValue), []);

  const onSubmit = (cat: RequestCategoryValues) => {
    if (!selectedHierarchy?.value) return;

    startTransition(() => {
      const previousState = currentState?.find((c) => c.id === cat.id);

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

      const promise = upsert(buildRequestCategoryUpsertArgs(cat, tenantId, String(selectedHierarchy.value)));
      if (cat.executionSteps) {
        upsertExecutionFlow(cat.executionSteps, cat.id);
      }

      toast.promise(promise, {
        loading: t('category.loading'),
        success: (response) => {
          if (response) {
            setCurrentState((prev) => prev.map((c) => (c.id === response.id ? { ...c, ...response } : c)));
          }
          setMode('none');
          return t('category.success');
        },
        error: (error) => {
          setCurrentState((prev) => [...prev]);
          return t('category.error', { error: error.message });
        },
      });
    });
  };

  useEffect(() => {
    if (initialValues) {
      setCurrentState(initialValues.categories);
      setSelectedHierarchy(initialValues.hierarchyId);
    } else if (requestHierarchies.length === 1) {
      const defaultHierarchy = hierarchyOptions[0];
      setSelectedHierarchy(defaultHierarchy);
    }
  }, [initialValues, requestHierarchies, hierarchyOptions]);

  const isFormActive = mode !== 'none';
  const firstLevelId = selectedHierarchyData?.levels[0].id ?? '';

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={30} collapsible ref={ref} minSize={0}>
        {!initialValues && (
          <div className="flex flex-col border-b bg-background/50 px-4 py-2">
            <h2 className="text-sm font-medium mb-2">{t('hierarchyLabel')}</h2>
            <Select
              isSearchable
              menuPortalTarget={null}
              isClearable={!disableHierarchyChange && hierarchyOptions.length > 1}
              options={hierarchyOptions}
              isDisabled={disableHierarchyChange || hierarchyOptions.length === 1}
              onChange={handleHierarchyChange}
              value={selectedHierarchy}
            />
            <span className="text-xs text-muted-foreground">{t('hierarchyDescription')}</span>
          </div>
        )}

        {selectedHierarchyData && <CategoryTreeView categories={currentState} onAddCategory={handleAddCategory} onEditCategory={handleEditCategory} hierarchy={selectedHierarchyData} />}
      </ResizablePanel>
      <ResizableHandle />

      <ResizablePanel className="flex-1 relative" defaultSize={70}>
        <div className="flex items-center justify-center h-full p-4 overflow-hidden">
          <button type="button" onClick={toggleSidebar} className="absolute top-1/2 -left-2 -translate-y-1/2 p-2 rounded-lg hover:bg-accent transition-colors z-10">
            {isSidebarCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {selectedHierarchy && selectedHierarchyData ? (
            isFormActive ? (
              <Form {...form}>
                <FormRoot className="h-full" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormError error={error} />
                  <CategoryForm formsOptions={formsOptions} requirementsOptions={requirementsOptions} mode={mode} isPending={isPending} handleCancelForm={handleCancelForm} />
                </FormRoot>
              </Form>
            ) : (
              <EmptyState
                title="Manage Request Categories"
                description='Select a category from the sidebar to edit or click "Add New" to create a new category.'
                icons={[FileStackIcon, BookCopyIcon, ContainerIcon]}
                actions={[
                  {
                    label: 'Create New Category',
                    onClick: () => handleAddCategory(firstLevelId),
                  },
                ]}
              />
            )
          ) : (
            <EmptyState
              title="Select a Hierarchy"
              description="Please select a hierarchy from the sidebar to manage its categories."
              icons={[PackageOpenIcon, FileCogIcon, BookIcon]}
              actions={[
                {
                  label: 'Create New Hierarchy',
                  href: {
                    pathname: '/admin/[tenantId]/configurations/request-hierarchies/new',
                    params: { tenantId },
                  },
                },
              ]}
            />
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default RequestTypeForm;
