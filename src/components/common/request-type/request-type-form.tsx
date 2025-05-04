'use client';

import { FC, useEffect, useMemo, useState, useTransition } from 'react';
import { useUpsertRequestCategory } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookCopyIcon, BookIcon, ContainerIcon, FileCogIcon, FileStackIcon, PackageOpenIcon, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { SingleValue } from 'react-select';
import { toast } from 'sonner';

import { RequestHierarchyWithLevelsType } from '@/types/prisma/hierarchy';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Select, { OptionType } from '@/components/custom-ui/select';
import EmptyState from '@/components/shared/empty-state';
import { FormActions, FormError, FormRoot } from '@/components/shared/form-root';

import { CategoryForm, getDefaultCategory, requestCategorySchema, RequestCategoryValues } from './category-form';
import { CategoryTreeView } from './category-tree-view';

export type RequestCategory = RequestCategoryValues & {
  parentCategoryId: string | null;
  subcategories: RequestCategory[];
};

interface RequestTypeFormValues {
  hierarchyId: OptionType;
  categories: RequestCategory[];
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
  const [isPending, startTransition] = useTransition();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [currentState, setCurrentState] = useState<RequestTypeFormValues>();
  const [selectedHierarchy, setSelectedHierarchy] = useState<SingleValue<OptionType>>();
  const [selectedHierarchyData, setSelectedHierarchyData] = useState<RequestHierarchyWithLevelsType>();
  const { mutateAsync: upsert, error } = useUpsertRequestCategory();

  const form = useForm({
    resolver: zodResolver(requestCategorySchema),
    defaultValues: getDefaultCategory(),
  });

  const hierarchyOptions = useMemo(() => {
    return requestHierarchies.map((hierarchy) => ({
      label: hierarchy.name,
      value: hierarchy.id,
    }));
  }, [requestHierarchies]);

  const handleAddCategory = () => {
    setIsAddingCategory(true);
    setIsEditingCategory(false);
    form.reset(getDefaultCategory());
  };

  const handleEditCategory = (category: RequestCategoryValues) => {
    setIsAddingCategory(false);
    setIsEditingCategory(true);
    form.reset(category);
  };

  const handleCancelForm = () => {
    setIsAddingCategory(false);
    setIsEditingCategory(false);
    form.reset(getDefaultCategory());
  };

  const handleHierarchyChange = (newValue: SingleValue<OptionType>) => {
    setSelectedHierarchy(newValue);
    const selectedHierarchyData = requestHierarchies.find((h) => h.id === newValue?.value);
    setSelectedHierarchyData(selectedHierarchyData);
  };

  useEffect(() => {
    if (initialValues) {
      setCurrentState(initialValues);
      setSelectedHierarchy(initialValues.hierarchyId);
      const selectedHierarchyData = requestHierarchies.find((h) => h.id === initialValues.hierarchyId?.value);
      setSelectedHierarchyData(selectedHierarchyData);
    }
  }, [initialValues, requestHierarchies]);

  const onSubmit = (cat: RequestCategoryValues) => {
    if (!selectedHierarchy) return;

    startTransition(() => {
      const promise = upsert({
        where: { id: cat.id },
        create: {
          id: cat.id,
          name: cat.name,
          description: cat.description,
          // For creation, isActive is derived from isSubCategoryVisible (as in the original logic)
          isActive: cat.isActive,
          isEligibleForNewClients: cat.isEligibleForNewClients,
          tenantId,
          // Set parentCategoryId to the provided _parentId or null if there is none
          parentCategoryId: cat._parentId ? cat._parentId : null,
          hierarchyId: String(selectedHierarchy.value),
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
          isActive: cat.isActive,
          isEligibleForNewClients: cat.isEligibleForNewClients,
          tenantId,
          hierarchyId: String(selectedHierarchy.value),
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
      toast.promise(promise, {
        loading: t('category.loading'),
        success: () => {
          setIsAddingCategory(false);
          setIsEditingCategory(false);
          form.reset(getDefaultCategory());
          return t('category.success');
        },
        error: (error) => {
          return t('category.error', { error: error.message });
        },
      });
    });
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={30}>
        {!initialValues && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 mb-2">{t('hierarchyLabel')}</h2>
            <Select
              menuPortalTarget={null}
              isSearchable
              isClearable={!disableHierarchyChange && hierarchyOptions.length > 1}
              options={hierarchyOptions}
              isDisabled={disableHierarchyChange || hierarchyOptions.length === 1}
              onChange={handleHierarchyChange}
              value={selectedHierarchy}
            />
            <span className="text-xs text-gray-500">{t('hierarchyDescription')}</span>
          </div>
        )}

        {selectedHierarchy && selectedHierarchyData && (
          <CategoryTreeView categories={currentState?.categories ?? []} onAddCategory={console.log} onEditCategory={handleEditCategory} hierarchy={selectedHierarchyData} />
        )}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="flex-1" defaultSize={70}>
        <div className="flex items-center justify-center h-full p-4 overflow-hidden">
          {selectedHierarchy ? (
            isEditingCategory || isAddingCategory ? (
              <div className="rounded-lg border h-full p-6 flex-1 flex flex-col overflow-hidden">
                <Form {...form}>
                  <FormRoot onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">{isAddingCategory ? t('createTitle') : t('editTitle')}</h2>
                      <Button variant="ghost" size="sm" type="button" onClick={handleCancelForm} disabled={isPending}>
                        <X className="h-4 w-4 mr-2" />
                        {t('cancel')}
                      </Button>
                    </div>
                    <FormError error={error} />
                    <CategoryForm formsOptions={forms} requirementsOptions={requirements} />
                    <FormActions isPending={isPending} title={isAddingCategory ? t('create') : t('update')} />
                  </FormRoot>
                </Form>
              </div>
            ) : (
              <EmptyState
                title="Manage Request Categories"
                description='Select a category from the sidebar to edit or click "Add New" to create a new category.'
                icons={[FileStackIcon, BookCopyIcon, ContainerIcon]}
                actions={[
                  {
                    label: 'Create New Category',
                    onClick: handleAddCategory,
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
