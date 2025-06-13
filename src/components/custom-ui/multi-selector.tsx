'use client';
import { Plus, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { OptionType } from '@/components/custom-ui/select';

type MultiSelectorProps = {
  className?: string;
  options: OptionType[];
  value: OptionType[];
  onChange: (value: OptionType[]) => void;
  messages: { title?: string; addTitle: string; removeTitle: string; empty: string };
};

export function MultiSelector({ options, value, onChange, messages, className }: MultiSelectorProps) {
  const addRequirement = (requirement: OptionType) => {
    const newRequirements = [...value, requirement];
    onChange(newRequirements);
  };

  const removeRequirement = (valueToRemove: string | number) => {
    const newRequirements = value.filter((r) => r.value !== valueToRemove);
    onChange(newRequirements);
  };

  return (
    <div className={cn('flex-1 flex flex-col', className)}>
      {messages.title && <h3 className="text-sm font-medium mb-2">{messages.title}</h3>}
      <div className="flex flex-wrap gap-2 mb-4">
        {value.map((req) => (
          <Badge key={req.value} variant="secondary" className="flex items-center gap-1">
            {req.label}
            <button type="button" aria-label={messages.removeTitle} onClick={() => removeRequirement(req.value)} className="ml-1 rounded-full cursor-pointer hover:bg-gray-200 p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {value.length === 0 && <div className="text-sm text-gray-500">{messages.empty}</div>}
      </div>
      <div className="border rounded-md p-3">
        <h4 className="text-xs font-medium mb-2">{messages.addTitle}</h4>
        <div className="grid grid-cols-2 gap-2">
          {options
            .filter((r) => !value.some((req) => req.value === r.value))
            .map((req) => (
              <button key={req.value} type="button" onClick={() => addRequirement(req)} className="flex cursor-pointer items-center text-xs text-left border rounded-md p-2 hover:bg-gray-50">
                <Plus className="h-3 w-3 mr-1 text-gray-500" />
                {req.label}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
