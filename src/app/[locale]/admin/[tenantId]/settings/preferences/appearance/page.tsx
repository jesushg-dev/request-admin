'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams } from 'next/navigation';
import { locales, usePathname, useRouter } from '@/i18n/routing';
import { useAppearanceSchema, type TAppearanceSchema } from '@/services/schemas/settings.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from 'next-intl';
import { useTheme } from 'next-themes';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFont } from '@/components/hoc/font-provider';
import { LanguageSelectOptions } from '@/components/language-select-options';

export default function AppearanceForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Get translations
  const t = useTranslations('admin.setting.preferencesAppearance');

  const appearanceSchema = useAppearanceSchema();

  type AppearanceFormValues = TAppearanceSchema;

  // Get current theme from next-themes
  const { theme, setTheme } = useTheme();

  // Get current locale from next-intl
  const currentLocale = useLocale();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  // Get font from FontProvider
  const { font: currentFont, setFont: setFontProvider } = useFont();

  // Default values for the form
  const defaultValues: AppearanceFormValues = {
    font: currentFont,
    theme: (theme === 'dark' ? 'dark' : 'light') as 'light' | 'dark',
    language: currentLocale,
  };

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Update form when theme, locale, or font changes externally
  useEffect(() => {
    if (mounted && theme) {
      form.setValue('theme', (theme === 'dark' ? 'dark' : 'light') as 'light' | 'dark');
    }
  }, [theme, mounted, form]);

  useEffect(() => {
    if (mounted) {
      form.setValue('language', currentLocale);
    }
  }, [currentLocale, mounted, form]);

  useEffect(() => {
    if (mounted) {
      form.setValue('font', currentFont);
    }
  }, [currentFont, mounted, form]);

  // This is needed to ensure the component is mounted before accessing window
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show toast when transition completes
  useEffect(() => {
    if (!isPending && isLoading) {
      // Transition completed, show success toast
      toast.success(t('toast.success'));
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  // Save preferences and apply changes
  function onSubmit(data: AppearanceFormValues) {
    setIsLoading(true);

    try {
      // Set font using FontProvider
      setFontProvider(data.font as 'inter' | 'manrope' | 'system' | 'mono' | 'openDyslexic' | 'lexend');

      // Set theme using next-themes
      setTheme(data.theme);

      // Change language using next-intl router
      if (data.language !== currentLocale) {
        startTransition(() => {
          router.replace(
            // @ts-expect-error TypeScript ensures params and pathname are valid
            { pathname, params },
            { locale: data.language as Locale }
          );
        });
        // isLoading will be set to false when isPending becomes false (handled in useEffect)
      } else {
        // If no language change, show toast immediately
        toast.success(t('toast.success'));
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error saving appearance preferences:', error);
      toast.error(t('toast.error'));
      setIsLoading(false);
    }
  }

  if (!mounted) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="font"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.font.label')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.font.placeholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="inter">{t('form.font.options.inter')}</SelectItem>
                      <SelectItem value="manrope">{t('form.font.options.manrope')}</SelectItem>
                      <SelectItem value="system">{t('form.font.options.system')}</SelectItem>
                      <SelectItem value="mono">{t('form.font.options.mono')}</SelectItem>
                      <SelectItem value="openDyslexic">{t('form.font.options.openDyslexic')}</SelectItem>
                      <SelectItem value="lexend">{t('form.font.options.lexend')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>{t('form.font.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.language.label')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.language.placeholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <LanguageSelectOptions />
                    </SelectContent>
                  </Select>
                  <FormDescription>{t('form.language.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>{t('form.theme.label')}</FormLabel>
                  <FormDescription>{t('form.theme.description')}</FormDescription>
                  <div className="grid max-w-md grid-cols-2 gap-8 pt-2">
                    <div
                      className={`cursor-pointer rounded-md border-2 ${field.value === 'light' ? 'border-primary' : 'border-muted'} p-1 hover:border-accent`}
                      onClick={() => form.setValue('theme', 'light')}>
                      <div className="space-y-2 rounded-sm bg-[#f8fafc] p-2">
                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-2 w-[80px] rounded-lg bg-[#e4e8ec]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#e4e8ec]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#e4e8ec]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#e4e8ec]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#e4e8ec]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#e4e8ec]" />
                        </div>
                      </div>
                      <span className="block w-full p-2 text-center font-normal">{t('form.theme.light')}</span>
                    </div>
                    <div
                      className={`cursor-pointer rounded-md border-2 ${field.value === 'dark' ? 'border-primary' : 'border-muted'} p-1 hover:border-accent`}
                      onClick={() => form.setValue('theme', 'dark')}>
                      <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                        <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                      </div>
                      <span className="block w-full p-2 text-center font-normal">{t('form.theme.dark')}</span>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || isPending}>
                {isLoading || isPending ? t('form.button.updating') : t('form.button.update')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
