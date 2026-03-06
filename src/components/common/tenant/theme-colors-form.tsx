'use client';

import { FC, useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { Palette, Sun, Moon, Save, RotateCcw, Eye, Type, Settings2, SlidersHorizontal, Download } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTenantContext } from '@/components/hoc/tenant-provider';
import { ThemeColorsPreview } from './theme-colors-preview';
import { authClient } from '@/server/auth-client';
import {
  parseThemeColors,
  serializeThemeColors,
  type ThemeColorKey,
  defaultThemeColors,
  defaultExtendedStyleProps,
} from '@/types/theme-colors';
import { colorToOklchSimple, oklchToColorPickerFormat } from '@/lib/color-utils';
import {
  FontStackSelect,
  ShadowControl,
  HslAdjustmentControls,
} from '@/components/common/tenant/theme-editor';
import { builtInPresetNames, getBuiltInPreset } from '@/lib/theme-presets';
import { adjustColorByHsl } from '@/lib/color-utils';
import type { HslAdjustments } from '@/types/theme-colors';
import { defaultHslAdjustments } from '@/types/theme-colors';
import { builtInPresetNames, getBuiltInPreset } from '@/lib/theme-presets';

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
  const [sectionTab, setSectionTab] = useState<'colors' | 'typography' | 'other' | 'adjustments'>(
    'colors'
  );
  const [activeTab, setActiveTab] = useState<'light' | 'dark'>('light');
  const [presetSelectValue, setPresetSelectValue] = useState<string>('');
  const [hslAdjustments, setHslAdjustments] = useState<HslAdjustments>(defaultHslAdjustments);
  const baseThemeForHslRef = useRef<{ light: Record<string, string>; dark: Record<string, string> } | null>(null);

  const parsedColors = parseThemeColors(initialThemeColors);
  const defaultValues: ThemeColorsFormValues = {
    light: {
      ...defaultThemeColors.light,
      ...defaultExtendedStyleProps,
      ...(parsedColors?.light ?? {}),
    },
    dark: {
      ...defaultThemeColors.dark,
      ...defaultExtendedStyleProps,
      ...(parsedColors?.dark ?? {}),
    },
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
  const colorKeys = themeColorKeys.map((x) => x.key);

  // When leaving Adjustments tab, clear base so next time we snapshot from current form
  useEffect(() => {
    if (sectionTab !== 'adjustments') baseThemeForHslRef.current = null;
  }, [sectionTab]);

  const applyHslToForm = (adj: HslAdjustments) => {
    if (!baseThemeForHslRef.current) {
      const vals = form.getValues();
      baseThemeForHslRef.current = {
        light: colorKeys.reduce(
          (acc, k) => {
            const v = vals.light?.[k];
            if (typeof v === 'string') acc[k] = v;
            return acc;
          },
          {} as Record<string, string>
        ),
        dark: colorKeys.reduce(
          (acc, k) => {
            const v = vals.dark?.[k];
            if (typeof v === 'string') acc[k] = v;
            return acc;
          },
          {} as Record<string, string>
        ),
      };
    }
    const base = baseThemeForHslRef.current;
    const { hueShift, saturationScale, lightnessScale } = adj;
    const newLight = { ...form.getValues().light };
    const newDark = { ...form.getValues().dark };
    colorKeys.forEach((key) => {
      const lightVal = base.light[key] ?? defaultThemeColors.light?.[key as ThemeColorKey];
      const darkVal = base.dark[key] ?? defaultThemeColors.dark?.[key as ThemeColorKey];
      if (lightVal)
        newLight[key] = adjustColorByHsl(lightVal, hueShift, saturationScale, lightnessScale);
      if (darkVal)
        newDark[key] = adjustColorByHsl(darkVal, hueShift, saturationScale, lightnessScale);
    });
    form.setValue('light', newLight);
    form.setValue('dark', newDark);
  };

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

  const exportCss = () => {
    const vals = form.getValues();
    const light = { ...defaultThemeColors.light, ...defaultExtendedStyleProps, ...vals.light };
    const dark = { ...defaultThemeColors.dark, ...defaultExtendedStyleProps, ...vals.dark };
    const lightVars = Object.entries(light)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `  --${k}: ${v};`)
      .join('\n');
    const darkVars = Object.entries(dark)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `  --${k}: ${v};`)
      .join('\n');
    const css = `/* Light theme */\n:root {\n${lightVars}\n}\n\n/* Dark theme */\n@media (prefers-color-scheme: dark) {\n  :root {\n${darkVars}\n  }\n}\n`;
    void navigator.clipboard.writeText(css).then(() => toast.success('CSS copied to clipboard'));
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
            <Tabs
              value={sectionTab}
              onValueChange={(v) =>
                setSectionTab(v as 'colors' | 'typography' | 'other' | 'adjustments')
              }
            >
              <TabsList className="mb-4 grid w-full max-w-2xl grid-cols-4">
                <TabsTrigger value="colors" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Colors
                </TabsTrigger>
                <TabsTrigger value="typography" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Typography
                </TabsTrigger>
                <TabsTrigger value="other" className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Other
                </TabsTrigger>
                <TabsTrigger value="adjustments" className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Adjustments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="typography" className="space-y-6 mt-4">
                <p className="text-sm text-muted-foreground">
                  Font stacks apply to both light and dark mode. Changes are saved with the theme.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <FontStackSelect
                    kind="font-sans"
                    value={watchedValues.light?.['font-sans']}
                    onChange={(value) => {
                      form.setValue('light.font-sans', value);
                      form.setValue('dark.font-sans', value);
                    }}
                  />
                  <FontStackSelect
                    kind="font-serif"
                    value={watchedValues.light?.['font-serif']}
                    onChange={(value) => {
                      form.setValue('light.font-serif', value);
                      form.setValue('dark.font-serif', value);
                    }}
                  />
                  <FontStackSelect
                    kind="font-mono"
                    value={watchedValues.light?.['font-mono']}
                    onChange={(value) => {
                      form.setValue('light.font-mono', value);
                      form.setValue('dark.font-mono', value);
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="adjustments" className="mt-4 space-y-6">
                <p className="text-sm text-muted-foreground">
                  Global HSL adjustments applied to all theme colors. Use presets or sliders, then
                  save to keep changes.
                </p>
                <HslAdjustmentControls
                  hslAdjustments={hslAdjustments}
                  onHslChange={(adj) => {
                    setHslAdjustments(adj);
                    applyHslToForm(adj);
                  }}
                  previewColors={{
                    background:
                      (watchedValues[activeTab]?.background as string) ??
                      defaultThemeColors[activeTab]?.background ??
                      'oklch(0.98 0 0)',
                    primary:
                      (watchedValues[activeTab]?.primary as string) ??
                      defaultThemeColors[activeTab]?.primary ??
                      'oklch(0.45 0.2 250)',
                    secondary:
                      (watchedValues[activeTab]?.secondary as string) ??
                      defaultThemeColors[activeTab]?.secondary ??
                      'oklch(0.55 0.15 250)',
                  }}
                />
              </TabsContent>

              <TabsContent value="other" className="space-y-6 mt-4">
                <p className="text-sm text-muted-foreground">
                  Border radius and shadow. Applied to both modes.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium">Border radius</label>
                    <FormField
                      control={form.control}
                      name="light.radius"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <input
                              className="border-input bg-background h-9 w-32 rounded-md border px-2 text-sm"
                              value={field.value ?? defaultExtendedStyleProps.radius}
                              onChange={(e) => {
                                const v = e.target.value;
                                field.onChange(v);
                                form.setValue('dark.radius', v);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <span className="mb-2 block text-xs font-medium">Shadow</span>
                    <ShadowControl
                      shadowColor={
                        (watchedValues.light?.['shadow-color'] as string) ??
                        defaultExtendedStyleProps['shadow-color']
                      }
                      shadowOpacity={parseFloat(
                        String(
                          watchedValues.light?.['shadow-opacity'] ??
                            defaultExtendedStyleProps['shadow-opacity']
                        ).replace(/px/g, '')
                      )}
                      shadowBlur={parseFloat(
                        String(
                          watchedValues.light?.['shadow-blur'] ??
                            defaultExtendedStyleProps['shadow-blur']
                        ).replace(/px/g, '') || '3'
                      )}
                      shadowSpread={parseFloat(
                        String(
                          watchedValues.light?.['shadow-spread'] ??
                            defaultExtendedStyleProps['shadow-spread']
                        ).replace(/px/g, '') || '0'
                      )}
                      shadowOffsetX={parseFloat(
                        String(
                          watchedValues.light?.['shadow-offset-x'] ??
                            defaultExtendedStyleProps['shadow-offset-x']
                        ).replace(/px/g, '') || '0'
                      )}
                      shadowOffsetY={parseFloat(
                        String(
                          watchedValues.light?.['shadow-offset-y'] ??
                            defaultExtendedStyleProps['shadow-offset-y']
                        ).replace(/px/g, '') || '1'
                      )}
                      onChange={(key, value) => {
                        const str =
                          typeof value === 'number'
                            ? key === 'shadow-opacity'
                              ? String(value)
                              : `${value}px`
                            : value;
                        form.setValue(`light.${key}` as any, str);
                        form.setValue(`dark.${key}` as any, str);
                      }}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="colors" className="mt-4">
                <div className="mb-4 flex flex-wrap items-center gap-4">
                  <span className="text-sm text-muted-foreground">Preset:</span>
                  <Select
                    value={presetSelectValue}
                    onValueChange={(name) => {
                      const preset = getBuiltInPreset(name);
                      if (preset?.styles) {
                        form.reset({
                          light: { ...form.getValues().light, ...preset.styles.light },
                          dark: { ...form.getValues().dark, ...preset.styles.dark },
                        });
                        toast.success(`Applied preset: ${preset.label}`);
                        setPresetSelectValue('');
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Apply a preset..." />
                    </SelectTrigger>
                    <SelectContent>
                      {builtInPresetNames.map((name) => {
                        const preset = getBuiltInPreset(name);
                        return (
                          <SelectItem key={name} value={name}>
                            {preset?.label ?? name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
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
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Light: {getCustomizedCount('light')} customized • Dark: {getCustomizedCount('dark')} customized
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={exportCss}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSS
                </Button>
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

