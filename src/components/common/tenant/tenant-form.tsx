'use client';

import { FC, useEffect, useTransition } from 'react';
import { authClient } from '@/server/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useController, useForm, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ColorPicker } from '@/components/custom-ui/color-picker';

export const tenantFormSchema = z.object({
  name: z.string().min(2, {
    message: 'admin.setting.organization.form.validation.name',
  }),
  slug: z
    .string()
    .min(2, {
      message: 'admin.setting.organization.form.validation.slug.min',
    })
    .regex(/^[a-z0-9-]+$/, 'admin.setting.organization.form.validation.slug.invalid'),

  logo: z.string().optional(),
  websiteUrl: z
    .string()
    .url({
      message: 'admin.setting.organization.form.validation.website',
    })
    .optional()
    .or(z.literal('')),
  title: z.string().optional(),
  description: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  contactEmail: z
    .string()
    .email({
      message: 'admin.setting.organization.form.validation.email',
    })
    .optional()
    .or(z.literal('')),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
});

export const getTenantFormDefaultValues = (): TenantFormValues => {
  return {
    name: '',
    slug: '',
    logo: '',
    websiteUrl: '',
    title: '',
    description: '',
    primaryColor: '',
    secondaryColor: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  };
};

export type TenantFormValues = z.infer<typeof tenantFormSchema>;

interface TenantFormProps {
  defaultValues?: {
    organizationId: string;
    values: TenantFormValues;
  };
}

const TenantForm: FC<TenantFormProps> = ({ defaultValues }) => {
  const t = useTranslations('tenants.organization');
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(tenantFormSchema),
    defaultValues: defaultValues?.values ?? getTenantFormDefaultValues(),
  });

  function onSubmit(data: TenantFormValues) {
    startTransition(async () => {
      const toastId = toast.loading(t('toast.saving'));
      if (defaultValues) {
        await authClient.organization.update(
          {
            data: { ...data },
            organizationId: defaultValues.organizationId,
          },
          {
            onRequest: () => {
              toast.loading(t('toast.updating'), { id: toastId });
            },
            onError: ({ error }) => {
              toast.error(
                t('toast.error', {
                  action: t('toast.updating'),
                  error: error.message,
                }),
                { id: toastId }
              );
            },
            onSuccess: () => {
              toast.success(t('toast.updateSuccess'), { id: toastId });
            },
          }
        );
      } else {
        await authClient.organization.create(
          { ...data },
          {
            onRequest: () => {
              toast.loading(t('toast.creating'), { id: toastId });
            },
            onError: ({ error }) => {
              toast.error(
                t('toast.error', {
                  action: t('toast.creating'),
                  error: error.message,
                }),
                { id: toastId }
              );
            },
            onSuccess: () => {
              toast.success(t('toast.createSuccess'), { id: toastId });
            },
          }
        );
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TenantFormFields />

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? t('form.buttons.saving') : t('form.buttons.save')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export const TenantFormFields = () => {
  const t = useTranslations('tenants.organization');
  const { control } = useFormContext<TenantFormValues>();

  return (
    <div className="flex flex-col mx-1">
      <div>
        <h3 className="text-lg font-medium">{t('basicInfo.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('basicInfo.description')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.labels.name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.placeholders.name')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SlugField />

        <FormField
          control={control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.labels.logo')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.placeholders.logo')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.labels.website')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.placeholders.website')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.labels.title')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.placeholders.title')} {...field} />
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
              <FormLabel>{t('form.labels.description')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('form.placeholders.description')} className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator className="my-6" />

      <div>
        <h3 className="text-lg font-medium">{t('branding.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('branding.description')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          control={control}
          name="primaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('branding.primaryColor')}</FormLabel>
              <FormControl>
                <ColorPicker value={field.value || ''} onChange={field.onChange} />
              </FormControl>
              <FormDescription>{t('branding.colorDescriptions.primary')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="secondaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('branding.secondaryColor')}</FormLabel>
              <FormControl>
                <ColorPicker value={field.value || ''} onChange={field.onChange} />
              </FormControl>
              <FormDescription>{t('branding.colorDescriptions.secondary')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator className="my-6" />

      <div>
        <h3 className="text-lg font-medium">{t('contactInfo.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('contactInfo.description')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          control={control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.labels.contactEmail')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.placeholders.email')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="contactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.labels.contactPhone')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.placeholders.phone')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="address"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>{t('form.labels.address')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('form.placeholders.address')} className="min-h-[80px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

const SlugField = () => {
  const t = useTranslations('tenants.organization');
  const { control, setError } = useFormContext<TenantFormValues>();
  const [isChecking, startTransition] = useTransition();

  const {
    field,
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({
    control,
    name: 'slug',
    rules: {
      validate: async (slug = '') => {
        if (slug.length < 2) return true;
        try {
          const response = await authClient.organization.checkSlug({ slug });

          if ('data' in response && response.data?.status !== undefined) {
            return response.data.status || t('form.validation.slug.taken');
          }

          if ('error' in response) {
            throw new Error(response.error?.message || t('form.validation.slug.taken'));
          }

          return t('form.validation.slug.taken');
        } catch (error) {
          console.error('Slug check failed:', error);
          return t('form.validation.slug.taken');
        }
      },
    },
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (field.value?.length >= 2 && !error) {
        startTransition(async () => {
          await authClient.organization.checkSlug(
            { slug: field.value },
            {
              onError: ({ error }) => {
                setError('slug', {
                  type: 'manual',
                  message: error.message || t('form.validation.slug.taken'),
                });
              },
              onSuccess: (response) => {
                if (!response.data.status) {
                  setError('slug', {
                    type: 'manual',
                    message: t('form.validation.slug.taken'),
                  });
                }
              },
            }
          );
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [field.value, error, setError, t]);

  return (
    <FormItem>
      <FormLabel>{t('form.labels.slug')}</FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            {...field}
            placeholder={t('form.placeholders.slug')}
            disabled={isSubmitting}
            onChange={(e) => {
              const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
              field.onChange(value);
            }}
          />
          {isChecking && (
            <div className="absolute right-2 top-2.5">
              <Loader className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      </FormControl>
      <FormDescription>{t('form.descriptions.slug')}</FormDescription>
      <FormMessage>{error?.message}</FormMessage>
    </FormItem>
  );
};

export default TenantForm;
