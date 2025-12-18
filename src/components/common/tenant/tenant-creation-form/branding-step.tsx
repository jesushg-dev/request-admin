'use client';

import { Palette, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerFormatSelect,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from '@/components/ui/color-picker';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

import { brandingSchema } from './schemas';

type BrandingFormValues = z.infer<typeof brandingSchema>;

export function BrandingStep() {
  const t = useTranslations('tenants.form.brandingStep');
  const { control, watch } = useFormContext();
  const primaryColor = watch('primaryColor') || '#0243ac';
  const secondaryColor = watch('secondaryColor') || '#297dd6';

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          {t('header.title')}
        </CardTitle>
        <CardDescription>{t('header.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-6">
        {/* Color Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t('colors.title')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{t('colors.description')}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('colors.primaryColor')}</FormLabel>
                  <FormControl>
                    <ColorPicker value={field.value || '#0243ac'} onValueChange={field.onChange} name={field.name}>
                      <div className="flex items-center gap-2">
                        <ColorPickerTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <ColorPickerSwatch />
                            <span className="ml-2 font-mono text-sm">{field.value || '#0243ac'}</span>
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
                  <FormDescription>{t('colors.primaryColorDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="secondaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('colors.secondaryColor')}</FormLabel>
                  <FormControl>
                    <ColorPicker value={field.value || '#297dd6'} onValueChange={field.onChange} name={field.name}>
                      <div className="flex items-center gap-2">
                        <ColorPickerTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <ColorPickerSwatch />
                            <span className="ml-2 font-mono text-sm">{field.value || '#297dd6'}</span>
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
                  <FormDescription>{t('colors.secondaryColorDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Live Preview */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{t('preview.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('preview.description')}</p>
          </div>

          <div className="border rounded-lg overflow-hidden shadow-lg bg-background">
            {/* Browser chrome */}
            <div className="bg-muted border-b p-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-muted-foreground/20"></div>
                <div className="w-3 h-3 rounded-full bg-muted-foreground/20"></div>
                <div className="w-3 h-3 rounded-full bg-muted-foreground/20"></div>
              </div>
              <div className="flex-1 mx-2">
                <div className="bg-background rounded-full text-xs py-1 px-3 text-muted-foreground text-center overflow-hidden whitespace-nowrap">example.com</div>
              </div>
              <div className="text-xs bg-foreground text-background px-1.5 py-0.5 rounded">1:1</div>
            </div>

            {/* Website header with primary color */}
            <div className="p-4 flex items-center justify-between transition-colors" style={{ backgroundColor: primaryColor }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/20 rounded flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg font-bold text-white">LO</span>
                </div>
                <span className="font-bold text-white text-lg">{t('preview.companyName')}</span>
              </div>
              <div className="flex gap-2">
                <div className="w-4 h-4 bg-white/20 rounded backdrop-blur-sm"></div>
                <div className="w-4 h-4 bg-white/20 rounded backdrop-blur-sm"></div>
                <div className="w-4 h-4 bg-white/20 rounded backdrop-blur-sm"></div>
              </div>
            </div>

            {/* Website content */}
            <div className="min-h-[300px] p-8 flex flex-col items-center justify-center text-center bg-background">
              <h1 className="text-3xl font-bold mb-3" style={{ color: primaryColor }}>
                {t('preview.heroTitle')}
              </h1>
              <p className="text-muted-foreground mb-6 max-w-md">{t('preview.heroDescription')}</p>

              <Button
                size="lg"
                className="font-semibold"
                style={{
                  backgroundColor: secondaryColor,
                  color: 'white',
                }}>
                {t('preview.ctaButton')}
              </Button>

              <div className="mt-12 grid grid-cols-4 gap-6 w-full max-w-md">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg transition-colors"
                    style={{
                      backgroundColor: secondaryColor + '20',
                      border: `1px solid ${secondaryColor}40`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Color Palette Preview */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('preview.primaryColor')}</p>
              <div className="flex items-center gap-2">
                <div className="h-12 w-full rounded-md border shadow-sm" style={{ backgroundColor: primaryColor }} />
                <span className="font-mono text-xs text-muted-foreground min-w-[80px]">{primaryColor}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('preview.secondaryColor')}</p>
              <div className="flex items-center gap-2">
                <div className="h-12 w-full rounded-md border shadow-sm" style={{ backgroundColor: secondaryColor }} />
                <span className="font-mono text-xs text-muted-foreground min-w-[80px]">{secondaryColor}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
