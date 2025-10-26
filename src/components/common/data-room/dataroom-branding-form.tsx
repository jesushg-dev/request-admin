'use client';

import { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertDataroomBrand } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';

export const brandingSchema = z.object({
  id: z.string(),
  dataroomId: z.string(),
  logo: z.string().url().nullable().default(null),
  banner: z.string().url().nullable().default(null),
  brandColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .nullable()
    .default(null),
  accentColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .nullable()
    .default(null),
});

export const getInitialValues = (dataroomId: string = '') => ({
  id: generateUuid(),
  dataroomId,
  logo: null,
  banner: null,
  brandColor: '#4f46e5',
  accentColor: '#818cf8',
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

interface DataroomBrandingProps {
  tenantId: string;
  initialValues?: BrandingFormValues | null;
}

export function DataroomBrandingForm({ tenantId, initialValues }: DataroomBrandingProps) {
  const t = useTranslations('admin.dataroom.branding');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertDataroomBrand();

  const form = useForm({
    resolver: zodResolver(brandingSchema),
    defaultValues: initialValues ?? getInitialValues(),
    mode: 'onChange',
  });

  const onSubmit = (values: BrandingFormValues) => {
    startTransition(async () => {
      const promise = upsert({
        create: {
          ...values,
          tenantId,
        },
        update: {
          ...values,
          tenantId,
        },
        where: { id: values.id, tenantId },
      });

      toast.promise(promise, {
        loading: t('form.saving'),
        success: () => {
          router.refresh();
          return t('form.saveSuccess');
        },
        error: (error) => t('form.saveError', { message: error.message }),
      });
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4 overflow-hidden">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1">
          {error && <PrismaErrorAlert error={error} />}
          <Card>
            <CardHeader>
              <CardTitle>{t('title')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.logo.label')}</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          {field.value ? (
                            <div className="flex flex-col items-center">
                              <img src={field.value} alt="Logo" className="max-h-24 mb-4" />
                              <Button variant="outline" size="sm" onClick={() => field.onChange(null)}>
                                {t('form.remove')}
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Input type="file" id="logo-upload" className="hidden" accept="image/*" />
                              <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                                <Upload className="h-10 w-10 text-muted-foreground" />
                                <span className="text-sm font-medium">{t('form.logo.uploadLabel')}</span>
                                <FormDescription>{t('form.logo.requirements')}</FormDescription>
                              </label>
                            </>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="banner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.banner.label')}</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          {field.value ? (
                            <div className="flex flex-col items-center">
                              <img src={field.value} alt="Banner" className="max-h-24 mb-4" />
                              <Button variant="outline" size="sm" onClick={() => field.onChange(null)}>
                                {t('form.remove')}
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Input type="file" id="banner-upload" className="hidden" accept="image/*" />
                              <label htmlFor="banner-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                                <Upload className="h-10 w-10 text-muted-foreground" />
                                <span className="text-sm font-medium">{t('form.banner.uploadLabel')}</span>
                                <FormDescription>{t('form.banner.requirements')}</FormDescription>
                              </label>
                            </>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="brandColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.brandColor.label')}</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <div
                            className="w-10 h-10 rounded-md border"
                            style={{
                              backgroundColor: field.value ? `${field.value}` : 'transparent',
                            }}
                          />
                          <Input {...field} value={field.value ?? '#4f46e5'} />
                          <Input type="color" value={field.value ?? '#4f46e5'} onChange={field.onChange} className="w-12 p-1 h-10" />
                        </div>
                      </FormControl>
                      <FormDescription>{t('form.brandColor.description')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.accentColor.label')}</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <div
                            className="w-10 h-10 rounded-md border"
                            style={{
                              backgroundColor: field.value ? `${field.value}` : 'transparent',
                            }}
                          />
                          <Input {...field} value={field.value ?? '#818cf8'} />
                          <Input type="color" value={field.value ?? '#818cf8'} onChange={field.onChange} className="w-12 p-1 h-10" />
                        </div>
                      </FormControl>
                      <FormDescription>{t('form.accentColor.description')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <LoaderCircle className="animate-spin mr-2" />}
                  {t('form.saveButton')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t('preview.title')}</CardTitle>
          <CardDescription>{t('preview.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col overflow-hidden">
          <div className="flex-1">
            <div
              className="border rounded-lg overflow-y-auto shadow-lg transition-all duration-300 hover:shadow-xl"
              style={
                {
                  '--brand-color': form.watch('brandColor'),
                  '--accent-color': form.watch('accentColor'),
                } as React.CSSProperties
              }>
              {/* Header Section */}
              <div
                className="h-48 bg-cover bg-center flex items-center justify-center relative"
                style={{
                  backgroundColor: form.watch('brandColor') ? `${form.watch('brandColor')}` : 'transparent',
                  backgroundImage: form.watch('banner') ? `url(${form.watch('banner')})` : 'none',
                }}>
                {form.watch('logo') ? (
                  <img src={form.watch('logo') ?? ''} alt={t('preview.logoAlt')} className="max-h-20 object-contain transition-opacity hover:opacity-90" />
                ) : (
                  <div className="text-white text-3xl font-bold animate-fade-in">{t('preview.logoPlaceholder')}</div>
                )}
              </div>

              {/* Content Area */}
              <div className="p-6 space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{t('preview.breadcrumb1')}</span>
                  <span>/</span>
                  <span>{t('preview.breadcrumb2')}</span>
                  <span>/</span>
                  <span
                    className="font-medium"
                    style={{
                      color: form.watch('accentColor') ? `${form.watch('accentColor')}` : 'transparent',
                    }}>
                    {t('preview.breadcrumb3')}
                  </span>
                </div>

                {/* Document Grid */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="group border rounded-lg p-4 hover:bg-accent/10 transition-all cursor-pointer">
                      <div
                        className="w-full h-32 rounded-md mb-3 bg-gradient-to-br from-brand/10 to-accent/10"
                        style={{
                          backgroundImage: `linear-gradient(45deg, ${form.watch('brandColor')}10, ${form.watch('accentColor')}10)`,
                        }}
                      />
                      <div className="space-y-2">
                        <div
                          className="h-4 w-3/4 rounded-sm bg-brand/80 animate-pulse"
                          style={{
                            backgroundColor: form.watch('brandColor') ? `${form.watch('brandColor')}` : 'transparent',
                          }}
                        />
                        <div
                          className="h-3 w-1/2 rounded-sm opacity-50 animate-pulse delay-75"
                          style={{
                            backgroundColor: form.watch('brandColor') ? `${form.watch('brandColor')}` : 'transparent',
                          }}
                        />
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>PDF</span>
                        <span>•</span>
                        <span>2.4 MB</span>
                        <span>•</span>
                        <span>{t('preview.updated')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
