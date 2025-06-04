import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { planInfoSchema } from './schemas';

type PlanInfoFormValues = z.infer<typeof planInfoSchema>;

export function PlanInfoStep() {
  const t = useTranslations('plans.form.planStep');
  const { control } = useFormContext<PlanInfoFormValues>();

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('header.title')}</CardTitle>
        <CardDescription>{t('header.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
        <div className="m-1 flex flex-col gap-2">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('name')}</FormLabel>
                <FormControl>
                  <Input className="h-8 w-full rounded" placeholder={t('namePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('description')}</FormLabel>
                <FormControl>
                  <Textarea className="h-8 w-full rounded" placeholder={t('descriptionPlaceholder')} {...field} />
                </FormControl>
                <FormDescription>{t('descriptionHelp')}</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('price')}</FormLabel>
                <FormControl>
                  <Input className="h-8 w-full rounded" min={0} type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormDescription>{t('priceHelp')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="durationInDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('duration')}</FormLabel>
                <FormControl>
                  <Input className="h-8 w-full rounded" min={1} type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormDescription>{t('durationHelp')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
