'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Control, useFormContext, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { AssignmentHierarchyWithLevelsType } from '@/types/zenstackhq/hierarchy';
import { generateUuid } from '@/lib/id';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Select, { optionSchema } from '@/components/custom-ui/select';
import { FormCheckboxItem, FormContent, FormItem } from '@/components/shared/form-root';

import { PillChain } from '../hierarchy/hierarchy-viewer-with-alternatives';

export const areaFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'requiredName'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  hierarchyId: optionSchema,
});

export type AreaFormValues = z.infer<typeof areaFormSchema>;

export const getAreaDefaultValue = (): AreaFormValues => ({
  id: generateUuid(),
  name: '',
  description: '',
  isActive: true,
  hierarchyId: { label: '', value: '' },
});

export default function AreaForm({ assignmentHierarchies = [], disableHierarchyChange = false }: { assignmentHierarchies: AssignmentHierarchyWithLevelsType[]; disableHierarchyChange?: boolean }) {
  const t = useTranslations('admin.area.create.form');
  const { control, setValue, getValues } = useFormContext<AreaFormValues>();

  const hierarchyOptions = useMemo(() => {
    return assignmentHierarchies.map((hierarchy) => ({
      label: hierarchy.name,
      value: hierarchy.id,
    }));
  }, [assignmentHierarchies]);

  useEffect(() => {
    if (hierarchyOptions.length === 1) {
      const singleOption = hierarchyOptions[0];
      const currentValue = getValues('hierarchyId');
      if (currentValue.value !== singleOption.value) {
        setValue('hierarchyId', singleOption);
      }
    }
  }, [hierarchyOptions, setValue, getValues]);

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('header.title')}</CardTitle>
        <CardDescription>{t('header.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
        <FormContent>
          {/* Name Field */}
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem label={t('nameLabel')} description={t('nameDescription')}>
                <Input placeholder={t('namePlaceholder')} {...field} />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="hierarchyId"
            render={({ field }) => (
              <FormItem label={t('hierarchyLabel')} description={t('hierarchyDescription')}>
                <Select
                  menuPortalTarget={null}
                  isSearchable
                  isClearable={!disableHierarchyChange && hierarchyOptions.length > 1}
                  options={hierarchyOptions}
                  isDisabled={disableHierarchyChange || hierarchyOptions.length === 1}
                  {...field}
                />
              </FormItem>
            )}
          />

          {/* Hierarchy View */}
          <HierarchyView control={control} assignmentHierarchies={assignmentHierarchies} />

          {/* Description Field */}
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem label={t('descriptionLabel')} description={t('descriptionDescription')}>
                <Textarea placeholder={t('descriptionPlaceholder')} {...field} value={field.value ?? ''} />
              </FormItem>
            )}
          />

          {/* Active Checkbox */}
          <FormField
            control={control}
            name="isActive"
            render={({ field }) => (
              <FormCheckboxItem label={t('isActiveLabel')} description={t('isActiveDescription')}>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormCheckboxItem>
            )}
          />
        </FormContent>
      </CardContent>
    </Card>
  );
}

const HierarchyView = ({ control, assignmentHierarchies }: { control: Control<AreaFormValues>; assignmentHierarchies: AssignmentHierarchyWithLevelsType[] }) => {
  const hierarchy = useWatch({
    control,
    name: 'hierarchyId',
    defaultValue: { label: '', value: '' },
  });

  const selectedHierarchy = assignmentHierarchies.find((h) => h.id === hierarchy.value);
  if (!selectedHierarchy) return null;

  return <PillChain hierarchy={selectedHierarchy} />;
};
