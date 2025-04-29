// FormsTab.tsx
'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { OptionType } from '@/components/custom-ui/select';

import { RequestCategoryValues } from '.';

type FormsTabProps = {
  options: OptionType[];
};

export function FormsTab({ options }: FormsTabProps) {
  const { setValue, getValues } = useFormContext<RequestCategoryValues>();
  const [forms, setForms] = useState(getValues('forms') || []);
  const t = useTranslations('admin.requestType.create.formsTab');

  const addForm = (formItem: OptionType) => {
    if (!forms.some((f) => f.value === formItem.value)) {
      const newForms = [...forms, formItem];
      setForms(newForms);
      setValue('forms', newForms);
    }
  };

  const removeForm = (value: string | number) => {
    const newForms = forms.filter((f) => f.value !== value);
    setForms(newForms);
    setValue('forms', newForms);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium mb-2">{t('title')}</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {forms.map((form) => (
          <Badge key={form.value} variant="secondary" className="flex items-center gap-1">
            {form.label}
            <button type="button" onClick={() => removeForm(form.value)} className="ml-1 rounded-full hover:bg-gray-200 p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {forms.length === 0 && <div className="text-sm text-gray-500">{t('empty')}</div>}
      </div>
      <div className="border rounded-md p-3">
        <h4 className="text-xs font-medium mb-2">{t('addTitle')}</h4>
        <div className="grid grid-cols-2 gap-2">
          {options
            .filter((f) => !forms.some((form) => form.value === f.value))
            .map((formItem) => (
              <button key={formItem.value} type="button" onClick={() => addForm(formItem)} className="flex items-center text-xs text-left border rounded-md p-2 hover:bg-gray-50">
                <Plus className="h-3 w-3 mr-1 text-gray-500" />
                {formItem.label}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
