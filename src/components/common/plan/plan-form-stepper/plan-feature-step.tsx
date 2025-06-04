import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { planFeatureSchema } from './schemas';

type PlanFeatureFormValues = z.infer<typeof planFeatureSchema>;

// Mock data for features (replace with actual data fetching logic)
const features = [
  { id: '1', name: 'Feature 1' },
  { id: '2', name: 'Feature 2' },
  { id: '3', name: 'Feature 3' },
];

export function PlanFeaturesStep() {
  const t = useTranslations('plans.form.featuresStep');
  const { control } = useFormContext<PlanFeatureFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  });

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('header.title')}</CardTitle>
        <CardDescription>{t('header.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
        <div className="m-1 flex flex-col gap-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2">
              <FormField
                control={control}
                name={`features.${index}.featureId`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectFeature')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {features.map((feature) => (
                          <SelectItem key={feature.id} value={feature.id}>
                            {feature.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`features.${index}.dailyLimit`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input type="number" placeholder={t('dailyLimit')} {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`features.${index}.totalLimit`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input type="number" placeholder={t('totalLimit')} {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`features.${index}.resetInterval`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('resetInterval')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">{t('resetIntervals.daily')}</SelectItem>
                        <SelectItem value="weekly">{t('resetIntervals.weekly')}</SelectItem>
                        <SelectItem value="monthly">{t('resetIntervals.monthly')}</SelectItem>
                        <SelectItem value="yearly">{t('resetIntervals.yearly')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="button" variant="destructive" onClick={() => remove(index)}>
                {t('remove')}
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            role="combobox"
            size="sm"
            className="border-2 border-dashed"
            onClick={() => append({ featureId: '', dailyLimit: undefined, totalLimit: undefined, resetInterval: '' })}>
            {t('addFeature')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
