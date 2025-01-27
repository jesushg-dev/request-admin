'use client';

import type * as React from 'react';

import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface CustomCheckboxProps extends React.ComponentPropsWithoutRef<typeof Checkbox> {
  label: string;
  description?: string;
  className?: string;
}

export function CustomCheckbox({ label, description, className, ...props }: CustomCheckboxProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center space-x-2">
        <Checkbox {...props} />
        <label htmlFor={props.id} className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      </div>
      {description && <p className="text-muted-foreground pl-6 text-sm">{description}</p>}
    </div>
  );
}
