'use client';

import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormItem } from '@/components/shared/form-root';

export function LinkEmailForm() {
  const t = useTranslations('public.link');
  const { control } = useFormContext();

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t('email.title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{t('email.description')}</p>
      </div>
      <div className="space-y-4">
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem label={t('email.label')}>
              <Input
                {...field}
                type="email"
                placeholder={t('email.placeholder')}
                autoFocus
              />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
