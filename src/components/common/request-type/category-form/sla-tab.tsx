// SlaTab.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { RequestCategoryValues } from '.';

export function SlaTab() {
  const { control } = useFormContext<RequestCategoryValues>();
  const t = useTranslations('admin.requestType.create.slaTab');

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="sla.resolutionTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('resolutionTime')}</FormLabel>
            <FormControl>
              <Input type="number" min="0" {...field} />
            </FormControl>
            <FormDescription>{t('resolutionDescription')}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="sla.escalationTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('escalationTime')}</FormLabel>
            <FormControl>
              <Input type="number" min="0" {...field} />
            </FormControl>
            <FormDescription>{t('escalationDescription')}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
