'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Eliminar la importación de toast
// import { toast } from "@/hooks/use-toast"

const appearanceFormSchema = z.object({
  font: z.string({
    required_error: 'Please select a font.',
  }),
  theme: z.enum(['light', 'dark'], {
    required_error: 'Please select a theme.',
  }),
  language: z.string({
    required_error: 'Please select a language.',
  }),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

// Language options
const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
];

export default function AppearanceForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Default values for the form
  const defaultValues: Partial<AppearanceFormValues> = {
    font: 'inter',
    theme: 'light',
    language: 'en',
  };

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // This is needed to ensure the component is mounted before accessing window
  useEffect(() => {
    setMounted(true);
  }, []);

  // Eliminar todas las notificaciones y alertas
  function onSubmit(data: AppearanceFormValues) {
    setIsLoading(true);

    // Simplemente usar console.log
    console.log('Actualizando preferencias de apariencia:', data);

    // Aplicar cambio de tema
    if (data.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setTimeout(() => {
      console.log('Preferencias de apariencia actualizadas');
      setIsLoading(false);
    }, 1000);
  }

  if (!mounted) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize the appearance of the app. Automatically switch between day and night themes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="font"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Font</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a font" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="manrope">Manrope</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="mono">Monospace</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Set the font you want to use in the dashboard.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Select your preferred language for the interface.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Theme</FormLabel>
                  <FormDescription>Select the theme for the dashboard.</FormDescription>
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
                      <span className="block w-full p-2 text-center font-normal">Light</span>
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
                      <span className="block w-full p-2 text-center font-normal">Dark</span>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update preferences'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
