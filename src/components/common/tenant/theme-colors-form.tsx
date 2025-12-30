'use client';

import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { Palette, Sun, Moon, Save, RotateCcw, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerFormatSelect,
  ColorPickerHueSlider,
  ColorPickerAlphaSlider,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from '@/components/ui/color-picker';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTenantContext } from '@/components/hoc/tenant-provider';
import { ThemeColorsPreview } from './theme-colors-preview';
import { authClient } from '@/server/auth-client';
import { parseThemeColors, serializeThemeColors, type ThemeColorKey, defaultThemeColors } from '@/types/theme-colors';
import { colorToOklchSimple, oklchToColorPickerFormat } from '@/lib/color-utils';

const themeColorKeys: { key: ThemeColorKey; label: string; description: string; category: string }[] = [
  // Base colors
  { key: 'background', label: 'Background', description: 'Main background color', category: 'Base' },
  { key: 'foreground', label: 'Foreground', description: 'Main text color', category: 'Base' },
  
  // Card colors
  { key: 'card', label: 'Card', description: 'Card background color', category: 'Components' },
  { key: 'card-foreground', label: 'Card Foreground', description: 'Card text color', category: 'Components' },
  
  // Popover colors
  { key: 'popover', label: 'Popover', description: 'Popover background color', category: 'Components' },
  { key: 'popover-foreground', label: 'Popover Foreground', description: 'Popover text color', category: 'Components' },
  
  // Primary colors
  { key: 'primary', label: 'Primary', description: 'Primary brand color', category: 'Brand' },
  { key: 'primary-foreground', label: 'Primary Foreground', description: 'Text color on primary', category: 'Brand' },
  
  // Secondary colors
  { key: 'secondary', label: 'Secondary', description: 'Secondary brand color', category: 'Brand' },
  { key: 'secondary-foreground', label: 'Secondary Foreground', description: 'Text color on secondary', category: 'Brand' },
  
  // Muted colors
  { key: 'muted', label: 'Muted', description: 'Muted background color', category: 'States' },
  { key: 'muted-foreground', label: 'Muted Foreground', description: 'Muted text color', category: 'States' },
  
  // Accent colors
  { key: 'accent', label: 'Accent', description: 'Accent background color', category: 'States' },
  { key: 'accent-foreground', label: 'Accent Foreground', description: 'Accent text color', category: 'States' },
  
  // Destructive colors
  { key: 'destructive', label: 'Destructive', description: 'Error/destructive color', category: 'States' },
  { key: 'destructive-foreground', label: 'Destructive Foreground', description: 'Text color on destructive', category: 'States' },
  
  // Border and input
  { key: 'border', label: 'Border', description: 'Border color', category: 'Base' },
  { key: 'input', label: 'Input', description: 'Input border color', category: 'Base' },
  { key: 'ring', label: 'Ring', description: 'Focus ring color', category: 'Base' },
  
  // Sidebar colors
  { key: 'sidebar', label: 'Sidebar', description: 'Sidebar background', category: 'Sidebar' },
  { key: 'sidebar-foreground', label: 'Sidebar Foreground', description: 'Sidebar text', category: 'Sidebar' },
  { key: 'sidebar-primary', label: 'Sidebar Primary', description: 'Sidebar primary color', category: 'Sidebar' },
  { key: 'sidebar-primary-foreground', label: 'Sidebar Primary Foreground', description: 'Sidebar primary text', category: 'Sidebar' },
  { key: 'sidebar-accent', label: 'Sidebar Accent', description: 'Sidebar accent color', category: 'Sidebar' },
  { key: 'sidebar-accent-foreground', label: 'Sidebar Accent Foreground', description: 'Sidebar accent text', category: 'Sidebar' },
  { key: 'sidebar-border', label: 'Sidebar Border', description: 'Sidebar border color', category: 'Sidebar' },
  { key: 'sidebar-ring', label: 'Sidebar Ring', description: 'Sidebar focus ring', category: 'Sidebar' },
  
  // Brand
  { key: 'brand-foreground', label: 'Brand Foreground', description: 'Brand text color', category: 'Brand' },
  
  // Chart colors
  { key: 'chart-1', label: 'Chart 1', description: 'First chart color', category: 'Charts' },
  { key: 'chart-2', label: 'Chart 2', description: 'Second chart color', category: 'Charts' },
  { key: 'chart-3', label: 'Chart 3', description: 'Third chart color', category: 'Charts' },
  { key: 'chart-4', label: 'Chart 4', description: 'Fourth chart color', category: 'Charts' },
  { key: 'chart-5', label: 'Chart 5', description: 'Fifth chart color', category: 'Charts' },
];

const themeColorsSchema = z.object({
  light: z.record(z.string(), z.any()).optional(),
  dark: z.record(z.string(), z.any()).optional(),
});

type ThemeColorsFormValues = z.infer<typeof themeColorsSchema>;

interface ThemeColorsFormProps {
  initialThemeColors?: string | null;
}

export const ThemeColorsForm: FC<ThemeColorsFormProps> = ({ initialThemeColors }) => {
  const t = useTranslations('tenants.organization.themeColors');
  const { tenantId } = useTenantContext();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'light' | 'dark'>('light');

  const parsedColors = parseThemeColors(initialThemeColors);
  const defaultValues: ThemeColorsFormValues = {
    light: parsedColors?.light ? { ...defaultThemeColors.light, ...parsedColors.light } : defaultThemeColors.light || {},
    dark: parsedColors?.dark ? { ...defaultThemeColors.dark, ...parsedColors.dark } : defaultThemeColors.dark || {},
  };

  const form = useForm<ThemeColorsFormValues>({
    resolver: zodResolver(themeColorsSchema),
    defaultValues,
  });

  const onSubmit = (data: ThemeColorsFormValues) => {
    startTransition(async () => {
      const toastId = toast.loading(t('saving'));
      
      try {
        // Convert all colors to OKLCH format
        const processedData: ThemeColorsFormValues = {
          light: {},
          dark: {},
        };

        // Process light theme colors
        if (data.light) {
          Object.entries(data.light).forEach(([key, value]) => {
            if (value && typeof value === 'string') {
              // If already in OKLCH format, use as-is, otherwise convert
              if (value.startsWith('oklch(')) {
                processedData.light![key] = value;
              } else {
                const oklch = colorToOklchSimple(value);
                processedData.light![key] = oklch || value;
              }
            }
          });
        }

        // Process dark theme colors
        if (data.dark) {
          Object.entries(data.dark).forEach(([key, value]) => {
            if (value && typeof value === 'string') {
              if (value.startsWith('oklch(')) {
                processedData.dark![key] = value;
              } else {
                const oklch = colorToOklchSimple(value);
                processedData.dark![key] = oklch || value;
              }
            }
          });
        }

        const themeColorsJson = serializeThemeColors(processedData);

        await authClient.organization.update(
          {
            data: { themeColors: themeColorsJson } as any,
            organizationId: tenantId,
          },
          {
            onRequest: () => {
              toast.loading(t('updating'), { id: toastId });
            },
            onError: ({ error }: { error: Error }) => {
              toast.error(t('error', { error: error.message }), { id: toastId });
            },
            onSuccess: () => {
              toast.success(t('success'));
              // Reload page to apply new colors
              window.location.reload();
            },
          }
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(t('error', { error: errorMessage }), { id: toastId });
      }
    });
  };

  const categories = Array.from(new Set(themeColorKeys.map((item) => item.category)));
  const totalColors = themeColorKeys.length;
  const watchedValues = form.watch();

  // Count how many colors are customized (different from defaults)
  const getCustomizedCount = (mode: 'light' | 'dark') => {
    const modeColors = watchedValues[mode] || {};
    const defaults = defaultThemeColors[mode] || {};
    return Object.keys(modeColors).filter(
      (key) => modeColors[key] && modeColors[key] !== defaults[key as ThemeColorKey]
    ).length;
  };

  const resetToDefaults = (mode: 'light' | 'dark') => {
    const defaults = defaultThemeColors[mode] || {};
    form.setValue(mode, defaults);
    const modeLabel = mode === 'light' ? t('lightMode') : t('darkMode');
    toast.success(`${modeLabel} colors reset to defaults`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t('title')}
            </CardTitle>
            <CardDescription className="mt-2">
              {t('description')}
              <Badge variant="secondary" className="ml-2">
                {totalColors} colors
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'light' | 'dark')}>
              <div className="flex items-center justify-between mb-4">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="light" className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    {t('lightMode')}
                    {getCustomizedCount('light') > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {getCustomizedCount('light')}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="dark" className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    {t('darkMode')}
                    {getCustomizedCount('dark') > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {getCustomizedCount('dark')}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => resetToDefaults(activeTab)}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Defaults
                </Button>
              </div>

              {(['light', 'dark'] as const).map((mode) => (
                <TabsContent key={mode} value={mode} className="space-y-6 mt-6">
                  <Alert>
                    <Eye className="h-4 w-4" />
                    <AlertDescription>
                      {getCustomizedCount(mode)} of {totalColors} colors customized
                    </AlertDescription>
                  </Alert>
                  
                  {/* Split View: Editor and Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Color Editor */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold">Color Editor</h4>
                      <ScrollArea className="h-[600px] pr-4">
                    {categories.map((category) => {
                      const categoryItems = themeColorKeys.filter((item) => item.category === category);
                      if (categoryItems.length === 0) return null;

                      const categoryCustomized = categoryItems.filter(
                        (item) => watchedValues[mode]?.[item.key] && watchedValues[mode]?.[item.key] !== defaultThemeColors[mode]?.[item.key]
                      ).length;

                      return (
                        <div key={category} className="space-y-4 mb-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-semibold mb-1">{category}</h4>
                              <p className="text-xs text-muted-foreground">
                                {categoryItems.length} colors
                                {categoryCustomized > 0 && (
                                  <span className="ml-2">
                                    • {categoryCustomized} customized
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <Separator />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categoryItems.map(({ key, label, description }) => (
                              <FormField
                                key={key}
                                control={form.control}
                                name={`${mode}.${key}`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{label}</FormLabel>
                                    <FormControl>
                                      <ColorPicker
                                        value={
                                          field.value && typeof field.value === 'string'
                                            ? oklchToColorPickerFormat(field.value) || field.value
                                            : defaultThemeColors[mode]?.[key]
                                              ? oklchToColorPickerFormat(defaultThemeColors[mode][key] || '') || defaultThemeColors[mode][key] || '#000000'
                                              : '#000000'
                                        }
                                        onValueChange={(value) => {
                                          // Convert to OKLCH if not already in that format
                                          if (value && !value.startsWith('oklch(')) {
                                            const oklch = colorToOklchSimple(value);
                                            field.onChange(oklch || value);
                                          } else {
                                            field.onChange(value);
                                          }
                                        }}
                                        name={field.name}
                                      >
                                        <div className="flex items-center gap-2">
                                          <ColorPickerTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                              <ColorPickerSwatch />
                                              <span className="ml-2 font-mono text-xs truncate">
                                                {(field.value && typeof field.value === 'string' ? field.value : defaultThemeColors[mode]?.[key] || '#000000')}
                                              </span>
                                            </Button>
                                          </ColorPickerTrigger>
                                        </div>
                                        <ColorPickerContent>
                                          <ColorPickerArea />
                                          <div className="space-y-2">
                                            <ColorPickerHueSlider />
                                            <ColorPickerAlphaSlider />
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <ColorPickerFormatSelect />
                                            <ColorPickerInput withoutAlpha />
                                          </div>
                                        </ColorPickerContent>
                                      </ColorPicker>
                                    </FormControl>
                                    <FormDescription>{description}</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                      </ScrollArea>
                    </div>

                    {/* Live Preview */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold">Live Preview</h4>
                      <div className="sticky top-4">
                        <ThemeColorsPreview
                          colors={{
                            ...defaultThemeColors[mode],
                            ...(watchedValues[mode] || {}),
                          }}
                          mode={mode}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Light: {getCustomizedCount('light')} customized • Dark: {getCustomizedCount('dark')} customized
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetToDefaults('light');
                    resetToDefaults('dark');
                  }}
                  disabled={isPending}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
                <Button type="submit" disabled={isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {t('save')}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

