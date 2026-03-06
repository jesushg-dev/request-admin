'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DEFAULT_FONT_SANS,
  DEFAULT_FONT_SERIF,
  DEFAULT_FONT_MONO,
} from '@/types/extended-theme';

/** Preset font stacks for each category (no Google Fonts; system/web-safe) */
const SANS_OPTIONS: { label: string; value: string }[] = [
  { label: 'System UI', value: DEFAULT_FONT_SANS },
  {
    label: 'Inter-style',
    value:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  {
    label: 'Segoe UI',
    value: "'Segoe UI', system-ui, sans-serif",
  },
];

const SERIF_OPTIONS: { label: string; value: string }[] = [
  { label: 'System Serif', value: DEFAULT_FONT_SERIF },
  {
    label: 'Georgia',
    value: 'Georgia, "Times New Roman", Times, serif',
  },
  {
    label: 'Palatino',
    value: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
  },
];

const MONO_OPTIONS: { label: string; value: string }[] = [
  { label: 'System Mono', value: DEFAULT_FONT_MONO },
  {
    label: 'Consolas',
    value: 'Consolas, "Liberation Mono", Menlo, Monaco, monospace',
  },
  {
    label: 'JetBrains Mono',
    value: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  },
];

export type FontStackKey = 'font-sans' | 'font-serif' | 'font-mono';

export interface FontStackSelectProps {
  /** Which font role to edit */
  kind: FontStackKey;
  value: string | undefined;
  onChange: (value: string) => void;
  label?: string;
}

const optionsByKind: Record<FontStackKey, { label: string; value: string }[]> = {
  'font-sans': SANS_OPTIONS,
  'font-serif': SERIF_OPTIONS,
  'font-mono': MONO_OPTIONS,
};

const defaultLabels: Record<FontStackKey, string> = {
  'font-sans': 'Sans-serif',
  'font-serif': 'Serif',
  'font-mono': 'Monospace',
};

export function FontStackSelect({
  kind,
  value,
  onChange,
  label,
}: FontStackSelectProps) {
  const options = optionsByKind[kind];
  const displayLabel = label ?? defaultLabels[kind];
  const fallback =
    kind === 'font-sans' ? DEFAULT_FONT_SANS : kind === 'font-serif' ? DEFAULT_FONT_SERIF : DEFAULT_FONT_MONO;
  const currentValue = value ?? fallback;
  const selectedOption = options.find((o) => o.value === currentValue);
  const effectiveOptions =
    currentValue && !selectedOption
      ? [...options, { label: 'Custom', value: currentValue }]
      : options;

  return (
    <div className="mb-4">
      <Label htmlFor={`font-${kind}`} className="mb-1.5 block text-xs">
        {displayLabel}
      </Label>
      <Select
        value={currentValue || fallback}
        onValueChange={onChange}
      >
        <SelectTrigger id={`font-${kind}`} className="h-9 text-xs">
          <SelectValue placeholder={`Select ${displayLabel.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {effectiveOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              <span style={{ fontFamily: opt.value }}>{opt.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
