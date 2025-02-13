'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const getAreaDefaultValue = (): AreaFormValues => ({
  id: generateUuid(),
  name: '',
  description: '',
  isActive: true,
});

export const areaFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'requiredName'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type AreaFormValues = z.infer<typeof areaFormSchema>;

// Props to decouple AreaForm entirely

export default function AreaForm() {
  const t = useTranslations('component.areaForm');
  const { control, formState } = useFormContext<AreaFormValues>();

  return (
    <div className="flex flex-col gap-2 px-1">
      {/* Name Field */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('nameLabel')}</FormLabel>
            <FormControl>
              <Input className="h-8 w-full rounded" placeholder={t('namePlaceholder')} {...field} value={field.value ?? ''} />
            </FormControl>
            {formState.errors.name?.message ? <FormMessage>{t(formState.errors.name.message as 'requiredName')}</FormMessage> : <FormDescription>{t('nameDescription')}</FormDescription>}
          </FormItem>
        )}
      />

      {/* Description Field */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('descriptionLabel')}</FormLabel>
            <FormControl>
              <Textarea placeholder={t('descriptionPlaceholder')} className="h-8 w-full rounded" {...field} />
            </FormControl>
            <FormDescription>{t('descriptionDescription')}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Active Checkbox */}
      <FormField
        control={control}
        name="isActive"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-3">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} id="isActive" />
            </FormControl>
            <div>
              <FormLabel htmlFor="isActive">{t('isActiveLabel')}</FormLabel>
              <FormDescription>{t('isActiveDescription')}</FormDescription>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
