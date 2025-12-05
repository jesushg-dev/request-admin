import { type THierarchySchema } from '@/services/schemas/hierarchy';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormCheckboxItem, FormContent, FormItem, FormSection } from '@/components/shared/form-root';

export type HierarchyFormValues = THierarchySchema;

export const getDefaultHierarchyFormValues = (): HierarchyFormValues => ({
  id: generateUuid(),
  name: '',
  description: '',
  isActive: true,
});

export function HierarchyForm() {
  const t = useTranslations('admin.hierarchy.hierarchyForm');
  const { control } = useFormContext<HierarchyFormValues>();

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('header.title')}</CardTitle>
        <CardDescription>{t('header.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
        <FormContent>
          <FormSection>
            <ScrollArea className="w-full flex-1 overflow-y-hidden">
              <div className="flex flex-col gap-2 flex-1 m-1">
                {/* Hierarchy Name Field */}
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem label={t('hierarchyName')} description={t('hierarchyNameDescription')}>
                      <Input placeholder={t('hierarchyNamePlaceholder')} {...field} />
                    </FormItem>
                  )}
                />

                {/* Description Field */}
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem label={t('description')} description={t('descriptionDescription')}>
                      <Textarea placeholder={t('descriptionPlaceholder')} {...field} />
                    </FormItem>
                  )}
                />

                {/* Is Active Checkbox */}
                <FormField
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <FormCheckboxItem label={t('isActive')} description={t('isActiveDescription')}>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormCheckboxItem>
                  )}
                />
              </div>
            </ScrollArea>
          </FormSection>
        </FormContent>
      </CardContent>
    </Card>
  );
}
