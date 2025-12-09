'use client';

import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CustomField {
  id: string;
  type: string;
  label: string;
  placeholder: string | null;
  required: boolean;
  disabled: boolean;
  orderIndex: number;
}

interface LinkCustomFieldsFormProps {
  fields: CustomField[];
}

export function LinkCustomFieldsForm({ fields }: LinkCustomFieldsFormProps) {
  const t = useTranslations('public.link');
  const { watch, setValue } = useFormContext();

  const customFieldResponses = watch('customFieldResponses') || {};

  const updateResponse = (fieldId: string, value: unknown) => {
    setValue('customFieldResponses', {
      ...customFieldResponses,
      [fieldId]: value,
    });
  };

  const renderField = (field: CustomField) => {
    const value = customFieldResponses[field.id];

    switch (field.type) {
      case 'SHORT_TEXT':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
            </Label>
            <Input id={field.id} value={(value as string) || ''} onChange={(e) => updateResponse(field.id, e.target.value)} placeholder={field.placeholder || ''} required={field.required} />
          </div>
        );

      case 'LONG_TEXT':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
            </Label>
            <Textarea id={field.id} value={(value as string) || ''} onChange={(e) => updateResponse(field.id, e.target.value)} placeholder={field.placeholder || ''} required={field.required} />
          </div>
        );

      case 'NUMBER':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              value={(value as number) || ''}
              onChange={(e) => updateResponse(field.id, e.target.value ? Number(e.target.value) : '')}
              placeholder={field.placeholder || ''}
              required={field.required}
            />
          </div>
        );

      case 'PHONE_NUMBER':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
            </Label>
            <Input
              id={field.id}
              type="tel"
              value={(value as string) || ''}
              onChange={(e) => updateResponse(field.id, e.target.value)}
              placeholder={field.placeholder || ''}
              required={field.required}
            />
          </div>
        );

      case 'URL':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
            </Label>
            <Input
              id={field.id}
              type="url"
              value={(value as string) || ''}
              onChange={(e) => updateResponse(field.id, e.target.value)}
              placeholder={field.placeholder || ''}
              required={field.required}
            />
          </div>
        );

      case 'CHECKBOX':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox id={field.id} checked={(value as boolean) || false} onCheckedChange={(checked) => updateResponse(field.id, checked === true)} required={field.required} />
            <Label htmlFor={field.id} className="cursor-pointer">
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
            </Label>
          </div>
        );

      case 'SELECT':
      case 'MULTI_SELECT':
        // For simplicity, treating SELECT and MULTI_SELECT the same
        // In a real implementation, you'd parse options from a field configuration
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
            </Label>
            <Input
              id={field.id}
              value={(value as string) || ''}
              onChange={(e) => updateResponse(field.id, e.target.value)}
              placeholder={field.placeholder || t('customFields.selectPlaceholder')}
              required={field.required}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t('customFields.title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{t('customFields.description')}</p>
      </div>
      <div className="space-y-4">
        {fields.map(renderField)}
      </div>
    </div>
  );
}
