'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { OptionType } from '@/components/custom-ui/select';

import { RequestCategoryValues } from '.';

type RequirementsTabProps = {
  options: OptionType[];
};

export function RequirementsTab({ options }: RequirementsTabProps) {
  const { setValue, getValues } = useFormContext<RequestCategoryValues>();
  const [requirements, setRequirements] = useState(getValues('requirements') || []);
  const t = useTranslations('admin.requestType.create.requirementsTab');

  const addRequirement = (requirement: OptionType) => {
    if (!requirements.some((r) => r.value === requirement.value)) {
      const newRequirements = [...requirements, requirement];
      setRequirements(newRequirements);
      setValue('requirements', newRequirements);
    }
  };

  const removeRequirement = (value: string | number) => {
    const newRequirements = requirements.filter((r) => r.value !== value);
    setRequirements(newRequirements);
    setValue('requirements', newRequirements);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium mb-2">{t('title')}</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {requirements.map((req) => (
          <Badge key={req.value} variant="secondary" className="flex items-center gap-1">
            {req.label}
            <button type="button" onClick={() => removeRequirement(req.value)} className="ml-1 rounded-full hover:bg-gray-200 p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {requirements.length === 0 && <div className="text-sm text-gray-500">{t('empty')}</div>}
      </div>
      <div className="border rounded-md p-3">
        <h4 className="text-xs font-medium mb-2">{t('addTitle')}</h4>
        <div className="grid grid-cols-2 gap-2">
          {options
            .filter((r) => !requirements.some((req) => req.value === r.value))
            .map((req) => (
              <button key={req.value} type="button" onClick={() => addRequirement(req)} className="flex items-center text-xs text-left border rounded-md p-2 hover:bg-gray-50">
                <Plus className="h-3 w-3 mr-1 text-gray-500" />
                {req.label}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
