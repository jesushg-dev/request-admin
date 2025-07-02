'use client';

import { useTransition } from 'react';
import { CreateRequestPriorityType, UpdateRequestPriorityType } from '@/actions/priority';
import { useRouter } from '@/i18n/routing';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { generateUuid } from '@/lib/id';
import { Badge } from '@/components/ui/badge';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { FormActions, FormCheckboxItem, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

// Schema definition for request priority type form
const formSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  primaryColor: z.string().min(1, 'Color is required'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional().default(''),
  level: z.number().min(0, 'Level must be a positive number').max(10, 'Level must be less than 10').default(0),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export type RequestPriorityTypeFormValues = z.infer<typeof formSchema>;

// Default values generator
export const getDefaultValues = (): RequestPriorityTypeFormValues => ({
  id: generateUuid(),
  name: '',
  primaryColor: '#000000',
  description: '',
  level: 0,
  isActive: true,
  isDefault: false,
});

interface RequestPriorityTypeFormProps {
  tenantId: string;
  initialValues?: RequestPriorityTypeFormValues | null;
}

// Main component for creating or editing a request priority type
export default function PriorityForm({ tenantId, initialValues }: RequestPriorityTypeFormProps) {
  const t = useTranslations('admin.requestPriorityType.form');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? getDefaultValues(),
  });

  const onSubmit = (values: RequestPriorityTypeFormValues) => {
    startTransition(async () => {
      try {
        const formData = {
          name: values.name,
          primaryColor: values.primaryColor,
          description: values.description,
          level: values.level,
          isActive: values.isActive,
        };

        let result;

        if (initialValues) {
          // Update existing priority
          result = await UpdateRequestPriorityType(values.id, formData, tenantId);
        } else {
          // Create new priority
          result = await CreateRequestPriorityType(formData, tenantId);
        }

        toast.success(t('successSave', { name: result?.name ?? '-' }));
        router.push({ pathname: '/admin/[tenantId]/configurations/priorities', params: { tenantId } });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        toast.error(t('errorSave', { message: errorMessage }));
      }
    });
  };

  return (
    <Form {...form}>
      <FormRoot onSubmit={form.handleSubmit(onSubmit)}>
        <FormContent>
          <FormSection>
            <div className="flex gap-1">
              {/* Name field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem label={t('name')} description={t('namePlaceholder')} className="flex-1">
                    <Input placeholder={t('namePlaceholder')} {...field} />
                  </FormItem>
                )}
              />

              {/* Color picker with preview badge */}
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem label={t('color')} description={t('colorPlaceholder')}>
                    <div className="flex items-center gap-2">
                      <Input type="color" {...field} className="w-12 h-8 p-1" />
                      <Badge style={{ backgroundColor: field.value, color: '#fff' }}>
                        <Tag className="mr-1 h-3 w-3" />
                        {form.getValues('name') || t('preview')}
                      </Badge>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Description field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem label={t('description')} description={t('descriptionPlaceholder')}>
                  <Input placeholder={t('descriptionPlaceholder')} {...field} />
                </FormItem>
              )}
            />

            {/* Level field */}
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem label={t('level')} description={t('levelPlaceholder')}>
                  <Input type="number" min={0} max={100} placeholder={t('levelPlaceholder')} {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                </FormItem>
              )}
            />
            {/* Active status checkbox */}

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormCheckboxItem label={t('isActive')} description={t('isActivePlaceholder')}>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormCheckboxItem>
              )}
            />

            {/* Default status checkbox */}

            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormCheckboxItem label={t('isDefault')} description={t('isDefaultPlaceholder')}>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormCheckboxItem>
              )}
            />
          </FormSection>
        </FormContent>

        {/* Actions: Create or Update */}
        <FormActions isPending={isPending} title={initialValues ? t('update') : t('create')} className="px-4" />
      </FormRoot>
    </Form>
  );
}
