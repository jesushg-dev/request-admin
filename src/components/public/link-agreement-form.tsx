'use client';

import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FormItem } from '@/components/shared/form-root';

interface LinkAgreementFormProps {
  agreementContent: string;
  requireName: boolean;
}

export function LinkAgreementForm({ agreementContent, requireName }: LinkAgreementFormProps) {
  const t = useTranslations('public.link');
  const { control } = useFormContext();

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t('agreement.title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{t('agreement.description')}</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t('agreement.contentLabel')}</Label>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            <div className="whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{ __html: agreementContent }} />
          </ScrollArea>
        </div>

        {requireName && (
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem label={t('agreement.nameLabel')}>
                <Input {...field} placeholder={t('agreement.namePlaceholder')} />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name="agreementAccepted"
          render={({ field }) => (
            <div className="flex items-center space-x-2">
              <Checkbox id="accept" checked={field.value} onCheckedChange={field.onChange} />
              <Label htmlFor="accept" className="text-sm font-normal cursor-pointer">
                {t('agreement.acceptLabel')}
              </Label>
            </div>
          )}
        />
      </div>
    </div>
  );
}
