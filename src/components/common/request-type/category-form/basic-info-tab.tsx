// BasicInfoTab.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormCheckboxItem, FormItem, FormSection } from '@/components/shared/form-root';

import { RequestCategoryValues } from '.';

export function BasicInfoTab() {
  const { control } = useFormContext<RequestCategoryValues>();
  const t = useTranslations('admin.requestType.create.basicTab');

  return (
    <FormSection>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem label={t('name')} description={t('nameDescription')}>
            <Input placeholder={t('namePlaceholder')} {...field} />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem label={t('description')} description={t('descriptionDescription')}>
            <Textarea placeholder={t('descriptionPlaceholder')} {...field} value={field.value || ''} />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="isActive"
        render={({ field }) => (
          <FormCheckboxItem label={t('active')} description={t('activeDescription')}>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormCheckboxItem>
        )}
      />

      <FormField
        control={control}
        name="isEligibleForNewClients"
        render={({ field }) => (
          <FormCheckboxItem label={t('newClients')} description={t('newClientsDescription')}>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormCheckboxItem>
        )}
      />
    </FormSection>
  );
}
