'use client';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-9 w-9 rounded-md border" style={{ backgroundColor: value }} />
      <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full" placeholder="#000000" />
      <Input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 cursor-pointer" />
    </div>
  );
}
