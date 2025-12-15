'use client';

import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormItem } from '@/components/shared/form-root';

export function LinkPasswordForm() {
  const t = useTranslations('public.link');
  const { control } = useFormContext();

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t('password.title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{t('password.description')}</p>
      </div>
      <div className="space-y-4">
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem label={t('password.label')}>
              <Input {...field} type="password" placeholder={t('password.placeholder')} autoFocus />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
