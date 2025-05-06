'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiSelector } from '@/components/custom-ui/multi-selector';
import { optionSchema, OptionType } from '@/components/custom-ui/select';

import { BasicInfoTab } from './basic-info-tab';
import { ExecutionStepsTab, stepFormSchema } from './execution-steps-tab';
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
  executionSteps: z.array(stepFormSchema),
  guides: z.array(guideSchema),
  children: z.array(z.string()),
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
  executionSteps: [],
  guides: [],
  children: [],
});

interface CategoryFormProps {
  formsOptions: OptionType[];
  requirementsOptions: OptionType[];
}

export function CategoryForm({ formsOptions = [], requirementsOptions = [] }: CategoryFormProps) {
  const t = useTranslations('admin.requestType.create');
  const { control } = useFormContext<RequestCategoryValues>();

  return (
    <Tabs defaultValue="basic" className="w-full h-full overflow-hidden flex flex-col gap-2">
      <TabsList className="grid grid-cols-6">
        <TabsTrigger value="basic">{t('tabs.basic')}</TabsTrigger>
        <TabsTrigger value="requirements">{t('tabs.requirements')}</TabsTrigger>
        <TabsTrigger value="forms">{t('tabs.forms')}</TabsTrigger>
        <TabsTrigger value="sla">{t('tabs.sla')}</TabsTrigger>
        <TabsTrigger value="execution-steps">{t('tabs.executionSteps')}</TabsTrigger>
        <TabsTrigger value="guides">{t('tabs.guides')}</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="flex-1 flex flex-col overflow-hidden">
        <BasicInfoTab />
      </TabsContent>

      <TabsContent value="requirements" className="flex-1 flex flex-col overflow-hidden">
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
                  messages={{ title: t('requirementsTab.title'), addTitle: t('requirementsTab.addTitle'), empty: t('requirementsTab.empty') }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TabsContent>

      <TabsContent value="forms" className="flex-1 flex flex-col overflow-hidden">
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
                  messages={{ title: t('formsTab.title'), addTitle: t('formsTab.addTitle'), empty: t('formsTab.empty') }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TabsContent>

      <TabsContent value="sla" className="flex-1 flex flex-col overflow-hidden">
        <SlaTab />
      </TabsContent>

      <TabsContent value="execution-steps" className="flex-1 flex flex-col overflow-hidden">
        <ExecutionStepsTab />
      </TabsContent>

      <TabsContent value="guides" className="flex-1 flex flex-col overflow-hidden">
        <GuideTab />
      </TabsContent>
    </Tabs>
  );
}
