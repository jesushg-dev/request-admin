// category-form/index.tsx
import { executionFlowSchema } from '@/services/schemas/execution-flow';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { RequestLevelType } from '@/types/zenstackhq/hierarchy';
import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiSelector } from '@/components/custom-ui/multi-selector';
import { optionSchema, OptionType } from '@/components/custom-ui/select';
import FlowBuilder from '@/components/process-flow/flow-builder/flow-builder';
import { TabSection } from '@/components/shared/tab-section';

import { BlockedResourcesInfo } from '../blocked-resources-info';
import { useHierarchicalResourceContext } from '../hierarchical-category-provider';
import { RequestTypeFormValues } from '../request-type-form';
import { BasicInfoTab } from './basic-info-tab';
import { guideSchema, GuideTab } from './guides-tab';
import { SlaTab } from './sla-tab';

export const requestCategorySchema = z.object({
  id: z.string(),
  hierarchyLevelId: z.string(),
  parentCategoryId: z.string().nullish(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(100, { message: 'Name must be less than 100 characters' }),
  description: z.string().nullish(),
  isActive: z.boolean().default(true),
  isEligibleForNewClients: z.boolean().default(true),
  requirements: z.array(optionSchema).optional(),
  forms: z.array(optionSchema).optional(),
  sla: z.object({
    id: z.string(),
    resolutionTime: z.coerce.number().min(0, { message: 'Resolution time cannot be negative' }),
    escalationTime: z.coerce.number().min(0, { message: 'Escalation time cannot be negative' }),
  }),
  guides: z.array(guideSchema),
  children: z.array(z.string()),
  executionSteps: executionFlowSchema.optional(),
});

export type RequestCategoryValues = z.infer<typeof requestCategorySchema>;

export const getDefaultCategory = (hierarchyLevelId: string, parentCategoryId?: string | null): RequestCategoryValues => ({
  id: generateUuid(),
  hierarchyLevelId,
  parentCategoryId,
  name: '',
  description: '',
  isActive: true,
  isEligibleForNewClients: true,
  sla: {
    id: generateUuid(),
    resolutionTime: 24,
    escalationTime: 4,
  },
  requirements: [],
  forms: [],
  guides: [],
  children: [],
});

interface CategoryFormProps {
  formsOptions: OptionType[];
  requirementsOptions: OptionType[];
  handleCancelForm: () => void;
  isPending: boolean;
  mode: 'add' | 'edit';
  currentState: RequestTypeFormValues['categories'];
  levels: RequestLevelType[];
}

export function CategoryForm({ levels, formsOptions = [], requirementsOptions = [], handleCancelForm, isPending, mode }: CategoryFormProps) {
  const t = useTranslations('admin.requestType.create');
  const { control, setValue } = useFormContext<RequestCategoryValues>();
  const formTitle = mode === 'add' ? t('create') : t('update');
  const currentCategoryId = useWatch({ control, name: 'id' });

  const { getInheritedGroups, getChildGroups, promoteResource } = useHierarchicalResourceContext();

  // Helper para filtrar seleccionables
  function getSelectableResources(allOptions: OptionType[], currentSelected: OptionType[], inheritedGroups: { resources: OptionType[] }[], childGroups: { resource: OptionType }[]): OptionType[] {
    const inheritedValues = new Set(inheritedGroups.flatMap((group) => group.resources.map((r) => r.value)));
    const blockedValues = new Set(childGroups.map((group) => group.resource.value));
    const selectedValues = new Set(currentSelected.map((r) => r.value));
    return allOptions.filter((r) => !inheritedValues.has(r.value) && !blockedValues.has(r.value) && !selectedValues.has(r.value));
  }

  // Obtener los valores actuales del formulario
  const currentRequirements = useWatch({ control, name: 'requirements' }) ?? [];
  const currentForms = useWatch({ control, name: 'forms' }) ?? [];

  // Requirements
  const requirementInheritedGroups = getInheritedGroups(currentCategoryId, 'requirements', levels);
  const requirementChildGroups = getChildGroups(currentCategoryId, 'requirements', levels);
  const requirementBlockedCount = requirementChildGroups.reduce((total, group) => total + (group.resource ? 1 : 0), 0);
  const selectableRequirements = getSelectableResources(requirementsOptions, currentRequirements, requirementInheritedGroups, requirementChildGroups);
  const onPromoteRequirement = (resource: OptionType) => {
    promoteResource(currentCategoryId, 'requirements', resource);
    // Agregar el recurso promovido al campo del formulario si no está
    if (!currentRequirements.some((r) => r.value === resource.value)) {
      setValue('requirements', [...currentRequirements, resource]);
    }
  };

  // Forms
  const formInheritedGroups = getInheritedGroups(currentCategoryId, 'forms', levels);
  const formChildGroups = getChildGroups(currentCategoryId, 'forms', levels);
  const formBlockedCount = formChildGroups.reduce((total, group) => total + (group.resource ? 1 : 0), 0);
  const selectableForms = getSelectableResources(formsOptions, currentForms, formInheritedGroups, formChildGroups);
  const onPromoteForm = (resource: OptionType) => {
    promoteResource(currentCategoryId, 'forms', resource);
    if (!currentForms.some((r) => r.value === resource.value)) {
      setValue('forms', [...currentForms, resource]);
    }
  };

  return (
    <Tabs defaultValue="basic" className="h-full overflow-hidden flex flex-col gap-2">
      <TabsList className="flex gap-2 h-8 w-full">
        <TabsTrigger value="basic">{t('tabs.basic')}</TabsTrigger>
        <TabsTrigger value="requirements">{t('tabs.requirements')}</TabsTrigger>
        <TabsTrigger value="forms">{t('tabs.forms')}</TabsTrigger>
        <TabsTrigger value="sla">{t('tabs.sla')}</TabsTrigger>
        <TabsTrigger value="execution-steps">{t('tabs.executionSteps')}</TabsTrigger>
        <TabsTrigger value="guides">{t('tabs.guides')}</TabsTrigger>
      </TabsList>

      <TabSection
        value="basic"
        title={t('basicTab.header.title')}
        description={t('basicTab.header.description')}
        formTitle={formTitle}
        isPending={isPending}
        footerChildren={
          <Button type="button" variant="outline" onClick={handleCancelForm} className="w-full sm:w-auto" size="sm">
            {t('cancel')}
          </Button>
        }>
        <BasicInfoTab />
      </TabSection>

      <TabSection
        value="requirements"
        title={t('requirementsTab.header.title')}
        description={t('requirementsTab.header.description')}
        className="overflow-y-auto gap-4"
        formTitle={formTitle}
        isPending={isPending}
        footerChildren={
          <Button type="button" variant="outline" onClick={handleCancelForm} className="w-full sm:w-auto" size="sm">
            {t('cancel')}
          </Button>
        }>
        <BlockedResourcesInfo
          blockedCount={requirementBlockedCount}
          blockedGroups={requirementChildGroups}
          inheritedGroups={requirementInheritedGroups}
          blockedTitle={t('requirementsTab.blockedTitle')}
          blockedLabel={t('requirementsTab.blockedLabel')}
          inheritedTitle={t('requirementsTab.inheritedTitle')}
          onPromoteResource={onPromoteRequirement}
        />

        <FormField
          control={control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MultiSelector
                  value={field.value ?? []}
                  onChange={field.onChange}
                  options={selectableRequirements}
                  messages={{
                    title: t('requirementsTab.title'),
                    addTitle: t('requirementsTab.addTitle'),
                    empty: t('requirementsTab.empty'),
                    removeTitle: t('requirementsTab.removeTitle'),
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TabSection>

      <TabSection
        value="forms"
        title={t('formsTab.header.title')}
        description={t('formsTab.header.description')}
        className="overflow-y-auto"
        formTitle={formTitle}
        isPending={isPending}
        footerChildren={
          <Button type="button" variant="outline" onClick={handleCancelForm} className="w-full sm:w-auto" size="sm">
            {t('cancel')}
          </Button>
        }>
        <BlockedResourcesInfo
          blockedCount={formBlockedCount}
          blockedGroups={formChildGroups}
          inheritedGroups={formInheritedGroups}
          blockedTitle={t('formsTab.blockedTitle')}
          blockedLabel={t('formsTab.blockedLabel')}
          inheritedTitle={t('formsTab.inheritedTitle')}
          onPromoteResource={onPromoteForm}
        />

        <FormField
          control={control}
          name="forms"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MultiSelector
                  value={field.value ?? []}
                  onChange={field.onChange}
                  options={selectableForms}
                  messages={{
                    title: t('formsTab.title'),
                    addTitle: t('formsTab.addTitle'),
                    empty: t('formsTab.empty'),
                    removeTitle: t('formsTab.removeTitle'),
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TabSection>

      <TabSection
        value="sla"
        title={t('slaTab.header.title')}
        description={t('slaTab.header.description')}
        formTitle={formTitle}
        isPending={isPending}
        footerChildren={
          <Button type="button" variant="outline" onClick={handleCancelForm} className="w-full sm:w-auto" size="sm">
            {t('cancel')}
          </Button>
        }>
        <SlaTab />
      </TabSection>

      <TabsContent value="execution-steps" className="mt-0 flex-1 flex flex-col overflow-hidden">
        <FormField
          control={control}
          name="executionSteps"
          render={({ field }) => (
            <FormItem className="flex-1 flex overflow-hidden">
              <FormControl>
                <FlowBuilder value={field.value} onSave={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TabsContent>

      <TabSection
        value="guides"
        title={t('guidesTab.header.title')}
        description={t('guidesTab.header.description')}
        formTitle={formTitle}
        isPending={isPending}
        footerChildren={
          <Button type="button" variant="outline" onClick={handleCancelForm} className="w-full sm:w-auto" size="sm">
            {t('cancel')}
          </Button>
        }>
        <GuideTab />
      </TabSection>
    </Tabs>
  );
}
