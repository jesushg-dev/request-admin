'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { optionSchema, OptionType } from '@/components/custom-ui/select';

import { BasicInfoTab } from './basic-info-tab';
import { ExecutionStepsTab, stepFormSchema } from './execution-steps-tab';
import { FormsTab } from './forms-tab';
import { guideSchema, GuideTab } from './guides-tab';
import { RequirementsTab } from './requirements-tab';
import { SlaTab } from './sla-tab';

export const requestCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(100, { message: 'Name must be less than 100 characters' }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  isEligibleForNewClients: z.boolean().default(true),
  requirements: z.array(optionSchema).optional(),
  forms: z.array(optionSchema).optional(),
  sla: z.object({
    resolutionTime: z.coerce.number().min(0, { message: 'Resolution time cannot be negative' }),
    escalationTime: z.coerce.number().min(0, { message: 'Escalation time cannot be negative' }),
  }),
  executionSteps: z.array(stepFormSchema),
  guides: z.array(guideSchema),
});

export type RequestCategoryValues = z.infer<typeof requestCategorySchema>;

const getDefaultCategory = (): RequestCategoryValues => ({
  id: generateUuid(),
  name: '',
  description: '',
  isActive: true,
  isEligibleForNewClients: true,
  sla: { resolutionTime: 24, escalationTime: 4 },
  requirements: [],
  forms: [],
  executionSteps: [],
  guides: [],
});

interface CategoryFormProps {
  initialData: RequestCategoryValues | null;
  hierarchyId: string | number;
  onCancel: () => void;
  onSave: (data: RequestCategoryValues) => void;
  formsOptions: OptionType[];
  requirementsOptions: OptionType[];
}

export function CategoryForm({ initialData, formsOptions = [], requirementsOptions = [], onCancel, onSave }: CategoryFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const t = useTranslations('admin.requestType.create');

  const form = useForm({
    resolver: zodResolver(requestCategorySchema),
    defaultValues: initialData || getDefaultCategory(),
  });

  const onSubmit = (data: RequestCategoryValues) => {
    onSave(data);
    onCancel();
  };

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset(getDefaultCategory());
    }
  }, [initialData, form]);

  return (
    <div className="rounded-lg border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{initialData ? t('editTitle') : t('createTitle')}</h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          {t('cancel')}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-6 mb-6">
              <TabsTrigger value="basic">{t('tabs.basic')}</TabsTrigger>
              <TabsTrigger value="requirements">{t('tabs.requirements')}</TabsTrigger>
              <TabsTrigger value="forms">{t('tabs.forms')}</TabsTrigger>
              <TabsTrigger value="sla">{t('tabs.sla')}</TabsTrigger>
              <TabsTrigger value="execution-steps">{t('tabs.executionSteps')}</TabsTrigger>
              <TabsTrigger value="guides">{t('tabs.guides')}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <BasicInfoTab />
            </TabsContent>

            <TabsContent value="requirements">
              <RequirementsTab options={requirementsOptions} />
            </TabsContent>

            <TabsContent value="forms">
              <FormsTab options={formsOptions} />
            </TabsContent>

            <TabsContent value="sla">
              <SlaTab />
            </TabsContent>

            <TabsContent value="execution-steps">
              <ExecutionStepsTab />
            </TabsContent>

            <TabsContent value="guides">
              <GuideTab />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {initialData ? t('update') : t('create')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
