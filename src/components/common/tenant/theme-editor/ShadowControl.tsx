'use client';

import React from 'react';
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
import { Button } from '@/components/ui/button';
import { SliderWithInput } from './SliderWithInput';
import { colorToOklchSimple, oklchToColorPickerFormat } from '@/lib/color-utils';

export interface ShadowControlProps {
  shadowColor: string;
  shadowOpacity: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  onChange: (key: string, value: string | number) => void;
}

export function ShadowControl({
  shadowColor,
  shadowOpacity,
  shadowBlur,
  shadowSpread,
  shadowOffsetX,
  shadowOffsetY,
  onChange,
}: ShadowControlProps) {
  const pickerValue =
    shadowColor.startsWith('oklch(') && typeof window !== 'undefined'
      ? oklchToColorPickerFormat(shadowColor) ?? shadowColor
      : shadowColor;

  return (
    <div className="space-y-4">
      <div>
        <span className="mb-1.5 block text-xs font-medium">Shadow color</span>
        <ColorPicker
          value={pickerValue || '#000000'}
          onValueChange={(value) => {
            const oklch = value && !value.startsWith('oklch(') ? colorToOklchSimple(value) : value;
            onChange('shadow-color', oklch ?? value);
          }}
        >
          <div className="flex items-center gap-2">
            <ColorPickerTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ColorPickerSwatch />
                <span className="ml-2 truncate font-mono text-xs">{shadowColor || '—'}</span>
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
      </div>

      <SliderWithInput
        value={shadowOpacity}
        onChange={(v) => onChange('shadow-opacity', v)}
        min={0}
        max={1}
        step={0.01}
        unit=""
        label="Shadow opacity"
      />
      <SliderWithInput
        value={shadowBlur}
        onChange={(v) => onChange('shadow-blur', v)}
        min={0}
        max={50}
        step={0.5}
        unit="px"
        label="Blur radius"
      />
      <SliderWithInput
        value={shadowSpread}
        onChange={(v) => onChange('shadow-spread', v)}
        min={-50}
        max={50}
        step={0.5}
        unit="px"
        label="Spread"
      />
      <SliderWithInput
        value={shadowOffsetX}
        onChange={(v) => onChange('shadow-offset-x', v)}
        min={-50}
        max={50}
        step={0.5}
        unit="px"
        label="Offset X"
      />
      <SliderWithInput
        value={shadowOffsetY}
        onChange={(v) => onChange('shadow-offset-y', v)}
        min={-50}
        max={50}
        step={0.5}
        unit="px"
        label="Offset Y"
      />
    </div>
  );
}
