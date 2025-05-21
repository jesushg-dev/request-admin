import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormCheckboxItem, FormContent, FormItem, FormSection } from '@/components/shared/form-root';

export const hierarchySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(255, 'Description must be 255 characters or less').optional(),
  isActive: z.boolean().optional(),
});

export type HierarchyFormValues = z.infer<typeof hierarchySchema>;

export const getDefaultHierarchyFormValues = (): HierarchyFormValues => ({
  id: generateUuid(),
  name: '',
  description: '',
  isActive: true,
});

export function HierarchyForm() {
  const t = useTranslations('component.hierarchyForm');
  const { control } = useFormContext<HierarchyFormValues>();

  return (
    <FormContent>
      <FormSection>
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">{t('hierarchyDetails')}</h3>
          <p className="text-sm text-muted-foreground">{t('hierarchyDetailsDescription')}</p>
        </div>

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
  );
}
