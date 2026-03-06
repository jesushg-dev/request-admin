'use client';

import React, { useState } from 'react';
import { SliderWithInput } from './SliderWithInput';
import { HslPresetButton } from './HslPresetButton';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HslAdjustments } from '@/types/extended-theme';
import { defaultHslAdjustments } from '@/types/extended-theme';

const HSL_PRESETS: Array<{
  label: string;
  hueShift: number;
  saturationScale: number;
  lightnessScale: number;
}> = [
  { label: 'Hue (-120°)', hueShift: -120, saturationScale: 1, lightnessScale: 1 },
  { label: 'Hue (-60°)', hueShift: -60, saturationScale: 1, lightnessScale: 1 },
  { label: 'Hue (+60°)', hueShift: 60, saturationScale: 1, lightnessScale: 1 },
  { label: 'Hue (+120°)', hueShift: 120, saturationScale: 1, lightnessScale: 1 },
  { label: 'Hue Invert', hueShift: 180, saturationScale: 1, lightnessScale: 1 },
  { label: 'Grayscale', hueShift: 0, saturationScale: 0, lightnessScale: 1 },
  { label: 'Muted', hueShift: 0, saturationScale: 0.6, lightnessScale: 1 },
  { label: 'Vibrant', hueShift: 0, saturationScale: 1.4, lightnessScale: 1 },
  { label: 'Dimmer', hueShift: 0, saturationScale: 1, lightnessScale: 0.8 },
  { label: 'Brighter', hueShift: 0, saturationScale: 1, lightnessScale: 1.2 },
  {
    label: 'H(+30) S(-50) L(-5%)',
    hueShift: 30,
    saturationScale: 0.5,
    lightnessScale: 0.95,
  },
  {
    label: 'H(-20) S(+20) L(+5%)',
    hueShift: -20,
    saturationScale: 1.2,
    lightnessScale: 1.05,
  },
  {
    label: 'H(+20) S(-30) L(-5%)',
    hueShift: 20,
    saturationScale: 0.7,
    lightnessScale: 0.95,
  },
  {
    label: 'H(-10) S(-25) L(+10%)',
    hueShift: -10,
    saturationScale: 0.75,
    lightnessScale: 1.1,
  },
  {
    label: 'H(+60) S(+50) L(+10%)',
    hueShift: 60,
    saturationScale: 1.5,
    lightnessScale: 1.1,
  },
];

export interface HslAdjustmentControlsProps {
  hslAdjustments: HslAdjustments;
  onHslChange: (adj: HslAdjustments) => void;
  /** Optional: used for preset button preview swatches */
  previewColors?: {
    background: string;
    primary: string;
    secondary?: string;
  };
}

export function HslAdjustmentControls({
  hslAdjustments,
  onHslChange,
  previewColors,
}: HslAdjustmentControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const current = { ...defaultHslAdjustments, ...hslAdjustments };
  const bg = previewColors?.background ?? 'oklch(0.98 0 0)';
  const primary = previewColors?.primary ?? 'oklch(0.45 0.2 250)';
  const secondary = previewColors?.secondary ?? 'oklch(0.55 0.15 250)';

  return (
    <div className="@container">
      <div
        className={cn(
          '-m-1 mb-2 grid grid-cols-5 gap-2 overflow-hidden p-1 transition-all duration-300 ease-in-out @sm:grid-cols-7 @md:grid-cols-9 @lg:grid-cols-11 @xl:grid-cols-13',
          !isExpanded ? 'h-10' : 'h-auto'
        )}
      >
        {HSL_PRESETS.map((preset) => (
          <HslPresetButton
            key={preset.label}
            label={preset.label}
            hueShift={preset.hueShift}
            saturationScale={preset.saturationScale}
            lightnessScale={preset.lightnessScale}
            baseBg={bg}
            basePrimary={primary}
            baseSecondary={secondary}
            selected={
              current.hueShift === preset.hueShift &&
              current.saturationScale === preset.saturationScale &&
              current.lightnessScale === preset.lightnessScale
            }
            onClick={() => onHslChange(preset)}
          />
        ))}
      </div>

      {HSL_PRESETS.length > 5 ? (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground mb-4 flex w-full items-center justify-center text-xs"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide' : 'Show more'} presets
          <ChevronDown
            className={cn('ml-1 h-4 w-4 transition-transform duration-200', isExpanded && 'rotate-180')}
          />
        </Button>
      ) : null}

      <SliderWithInput
        value={current.hueShift}
        onChange={(value) => onHslChange({ ...current, hueShift: value })}
        unit="deg"
        min={-180}
        max={180}
        step={1}
        label="Hue shift"
      />
      <SliderWithInput
        value={current.saturationScale}
        onChange={(value) => onHslChange({ ...current, saturationScale: value })}
        unit="x"
        min={0}
        max={2}
        step={0.01}
        label="Saturation multiplier"
      />
      <SliderWithInput
        value={current.lightnessScale}
        onChange={(value) => onHslChange({ ...current, lightnessScale: value })}
        unit="x"
        min={0.2}
        max={2}
        step={0.01}
        label="Lightness multiplier"
      />
    </div>
  );
}
