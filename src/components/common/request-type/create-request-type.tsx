'use client';

import { FC, useTransition } from 'react';
import { createInitialRequestCategory } from '@/actions/request-type';
import { useRouter } from '@/i18n/routing';
import { useCreateRequestTypeSchema, type TCreateRequestTypeSchema } from '@/services/schemas/request-type/create-request-type.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Control, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { RequestHierarchyWithLevelsType } from '@/types/zenstackhq/hierarchy';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PillChain } from '@/components/common/hierarchy/hierarchy-viewer-with-alternatives';
import Select from '@/components/custom-ui/select';
import { useTenantContext } from '@/components/hoc/tenant-provider';
import { FormActions, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

interface RequestWorkflowOption {
  id: string;
  name: string;
}

interface CreateNewRequestTypeProps {
  requestHierarchies: RequestHierarchyWithLevelsType[];
  requestWorkflows?: RequestWorkflowOption[];
}

function RequestTypeHierarchyView({ control, hierarchies }: { control: Control<TCreateRequestTypeSchema>; hierarchies: RequestHierarchyWithLevelsType[] }) {
  const hierarchyId = useWatch({ control, name: 'hierarchyId' });
  const selectedHierarchy = hierarchies.find((h) => h.id === hierarchyId?.value);
  if (!selectedHierarchy) return null;
  return <PillChain hierarchy={selectedHierarchy} />;
}

const CreateNewRequestType: FC<CreateNewRequestTypeProps> = ({ requestHierarchies, requestWorkflows }) => {
  const t = useTranslations('admin.requestType.create');
  const router = useRouter();
  const { tenantId } = useTenantContext();
  const [isPending, startTransition] = useTransition();

  const hierarchyOptions = requestHierarchies.map((h) => ({ label: h.name, value: h.id }));
  const workflowOptions = (requestWorkflows ?? []).map((w) => ({ label: w.name, value: w.id }));

  const createRequestTypeSchema = useCreateRequestTypeSchema();

  const form = useForm<TCreateRequestTypeSchema>({
    resolver: zodResolver(createRequestTypeSchema),
    defaultValues: {
      hierarchyId: hierarchyOptions[0] || { value: '', label: '' },
      workflowId: undefined,
      parentCategoryName: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: TCreateRequestTypeSchema) => {
    startTransition(async () => {
      try {
        const selectedHierarchy = requestHierarchies.find((h) => h.id === values.hierarchyId.value);
        if (!selectedHierarchy) {
          toast.error(t('hierarchyNotFound'));
          return;
        }

        const firstLevel = selectedHierarchy.levels[0];
        if (!firstLevel) {
          toast.error(t('hierarchyHasNoLevels'));
          return;
        }

        // Crear la categoría padre inicial
        const categoryId = await createInitialRequestCategory({
          hierarchyId: String(values.hierarchyId.value),
          hierarchyLevelId: firstLevel.id,
          name: values.parentCategoryName,
          tenantId,
          requestWorkflowId: values.workflowId?.value ? String(values.workflowId.value) : null,
        });

        toast.success(t('parentCategoryCreated'));

        // Redirigir a la página de edición usando el ID de la categoría como slug
        // Usar router.replace para evitar problemas de navegación y forzar recarga
        router.replace({
          pathname: '/admin/[tenantId]/configurations/request-types/[slug]/edit',
          params: { tenantId, slug: categoryId },
        });
      } catch (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error);
        toast.error(t('errorCreatingCategory', { error: errorMessage }));
      }
    });
  };

  return (
    <Form {...form}>
      <FormRoot onSubmit={form.handleSubmit(onSubmit)}>
        <FormContent>
          <FormSection>
            <FormField
              control={form.control}
              name="hierarchyId"
              render={({ field }) => (
                <FormItem label={t('hierarchyLabel')} description={t('hierarchyDescription')}>
                  <Select isSearchable menuPortalTarget={null} options={hierarchyOptions} value={field.value} onChange={(newValue) => field.onChange(newValue)} />
                </FormItem>
              )}
            />

            <RequestTypeHierarchyView control={form.control} hierarchies={requestHierarchies} />

            <FormField
              control={form.control}
              name="workflowId"
              render={({ field }) => (
                <FormItem label={t('workflowLabel')} description={t('workflowDescription')}>
                  <Select
                    isSearchable
                    menuPortalTarget={null}
                    options={workflowOptions}
                    value={field.value}
                    onChange={(newValue) => field.onChange(newValue)}
                    placeholder={t('workflowPlaceholder')}
                    isClearable
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentCategoryName"
              render={({ field }) => (
                <FormItem label={t('parentCategoryNameLabel')} description={t('parentCategoryNameDescription')}>
                  <Input id="parentCategoryName" {...field} />
                </FormItem>
              )}
            />
          </FormSection>
        </FormContent>

        <FormActions isPending={isPending} title={t('createButton')} />
      </FormRoot>
    </Form>
  );
};

export default CreateNewRequestType;
