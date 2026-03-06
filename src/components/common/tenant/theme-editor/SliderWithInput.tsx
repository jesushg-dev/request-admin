'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export function SliderWithInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  unit = 'px',
  id: idProp,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  id?: string;
}) {
  const id = idProp ?? `slider-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalValue(raw);
    const num = parseFloat(raw.replace(',', '.'));
    if (!Number.isNaN(num)) {
      onChange(Math.max(min, Math.min(max, num)));
    }
  };

  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-medium">
          {label}
        </Label>
        <div className="flex items-center gap-1">
          <Input
            id={`${id}-input`}
            type="number"
            value={localValue}
            onChange={handleChange}
            onBlur={() => setLocalValue(value.toString())}
            min={min}
            max={max}
            step={step}
            className="h-6 w-18 px-2 text-xs"
          />
          {unit ? <span className="text-xs text-muted-foreground">{unit}</span> : null}
        </div>
      </div>
      <Slider
        id={id}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(values) => {
          const newValue = values[0];
          if (newValue !== undefined) {
            setLocalValue(String(newValue));
            onChange(newValue);
          }
        }}
        className="py-1"
      />
    </div>
  );
}
