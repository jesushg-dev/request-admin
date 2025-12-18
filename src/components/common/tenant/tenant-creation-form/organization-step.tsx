'use client';

import { useEffect, useTransition } from 'react';
import { authClient } from '@/server/auth-client';
import { Building, ChevronDown, LinkIcon, Loader, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useController, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/custom-ui/phone-input';

import { organizationSchema } from './schemas';

export function OrganizationStep() {
  const t = useTranslations('tenants.form.organizationStep');
  const { control } = useFormContext();

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('header.title')}</CardTitle>
        <CardDescription>{t('header.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-6">
        {/* Basic Information - Required */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                {t('basicInfo.title')}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{t('basicInfo.description')}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              Required
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('basicInfo.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('basicInfo.namePlaceholder')} {...field} />
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
                  <FormLabel>{t('basicInfo.logo')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('basicInfo.logoPlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">{t('basicInfo.logoDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('basicInfo.websiteUrl')}</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder={t('basicInfo.websiteUrlPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Content Information (collapsible) - Optional */}
        <Collapsible defaultOpen={false} className="group">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{t('contentInfo.title')}</span>
                    <Badge variant="secondary" className="text-xs font-normal">
                      Optional
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('contentInfo.description')}</p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contentInfo.titleLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('contentInfo.titlePlaceholder')} {...field} />
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
                    <FormLabel>{t('contentInfo.descriptionLabel')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('contentInfo.descriptionPlaceholder')} className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Contact Information (collapsible) - Optional */}
        <Collapsible defaultOpen={false} className="group">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{t('contactInfo.title')}</span>
                    <Badge variant="secondary" className="text-xs font-normal">
                      Optional
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('contactInfo.description')}</p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contactInfo.email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('contactInfo.emailPlaceholder')} {...field} />
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
                    <FormLabel>{t('contactInfo.phone')}</FormLabel>
                    <FormControl>
                      <PhoneInput placeholder={t('contactInfo.phonePlaceholder')} value={field.value || ''} onChange={(value) => field.onChange(value || '')} defaultCountry="US" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('contactInfo.address')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('contactInfo.addressPlaceholder')} className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

const SlugField = () => {
  const t = useTranslations('tenants.form.organizationStep');
  const { control, setError } = useFormContext<z.infer<typeof organizationSchema>>();
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
            return response.data.status || t('basicInfo.slugTaken');
          }

          if ('error' in response) {
            throw new Error(response.error?.message || t('basicInfo.slugTaken'));
          }

          return t('basicInfo.slugTaken');
        } catch (error) {
          console.error('Slug check failed:', error);
          return t('basicInfo.slugTaken');
        }
      },
    },
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (typeof field.value === 'string' && field.value.length >= 2 && !error) {
        startTransition(async () => {
          await authClient.organization.checkSlug(
            { slug: field.value ?? '' },
            {
              onError: ({ error }: { error: Error }) => {
                setError('slug', {
                  type: 'manual',
                  message: error.message || t('basicInfo.slugTaken'),
                });
              },
              onSuccess: (context: any) => {
                if (!context?.data?.status) {
                  setError('slug', {
                    type: 'manual',
                    message: t('basicInfo.slugTaken'),
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
      <FormLabel>{t('basicInfo.slug')}</FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            {...field}
            placeholder={t('basicInfo.slugPlaceholder')}
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
      <FormDescription>{t('basicInfo.slugDescription')}</FormDescription>
      <FormMessage>{error?.message}</FormMessage>
    </FormItem>
  );
};
