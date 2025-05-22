import { executionFlowSchema } from '@/services/schemas/execution-flow';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiSelector } from '@/components/custom-ui/multi-selector';
import { optionSchema, OptionType } from '@/components/custom-ui/select';
import FlowBuilder from '@/components/process-flow/flow-builder/flow-builder';
import { TabSection } from '@/components/shared/tab-section';

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
}

export function CategoryForm({ formsOptions = [], requirementsOptions = [], handleCancelForm, isPending, mode }: CategoryFormProps) {
  const t = useTranslations('admin.requestType.create');
  const { control } = useFormContext<RequestCategoryValues>();
  const formTitle = mode === 'add' ? t('create') : t('update');

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
        title="General Information"
        description="This information is used to identify the request type and its workflow."
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
        title="Requirements"
        description="These requirements are documents that are needed before the request can be processed."
        formTitle={formTitle}
        isPending={isPending}
        footerChildren={
          <Button type="button" variant="outline" onClick={handleCancelForm} className="w-full sm:w-auto" size="sm">
            {t('cancel')}
          </Button>
        }>
        <FormField
          control={control}
          name="requirements"
          render={({ field }) => (
            <FormItem className="flex-1 flex overflow-hidden">
              <FormControl>
                <MultiSelector
                  value={field.value ?? []}
                  onChange={field.onChange}
                  options={requirementsOptions}
                  messages={{
                    title: t('requirementsTab.title'),
                    addTitle: t('requirementsTab.addTitle'),
                    empty: t('requirementsTab.empty'),
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
        title="Associated Forms"
        description="These forms are used to collect information from the user before the request can be processed."
        formTitle={formTitle}
        isPending={isPending}
        footerChildren={
          <Button type="button" variant="outline" onClick={handleCancelForm} className="w-full sm:w-auto" size="sm">
            {t('cancel')}
          </Button>
        }>
        <FormField
          control={control}
          name="forms"
          render={({ field }) => (
            <FormItem className="flex-1 flex overflow-hidden">
              <FormControl>
                <MultiSelector
                  value={field.value ?? []}
                  onChange={field.onChange}
                  options={formsOptions}
                  messages={{
                    title: t('formsTab.title'),
                    addTitle: t('formsTab.addTitle'),
                    empty: t('formsTab.empty'),
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
        title="Service Level Agreement (SLA)"
        description="The SLA is used to track the performance of the request type and ensure that it meets the agreed-upon service levels."
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
        title="User Guides"
        description="The User Guides provide detailed instructions on how to resolve the request type."
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
