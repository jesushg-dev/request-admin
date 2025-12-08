'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  onSuccess: (responses: Record<string, unknown>) => void;
}

export function LinkCustomFieldsForm({ fields, onSuccess }: LinkCustomFieldsFormProps) {
  const t = useTranslations('public.link');
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required) {
        const value = responses[field.id];
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[field.id] = t('customFields.required', { field: field.label });
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSuccess(responses);
  };

  const updateResponse = (fieldId: string, value: unknown) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const renderField = (field: CustomField) => {
    const value = responses[field.id];
    const error = errors[field.id];

    switch (field.type) {
      case 'SHORT_TEXT':
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
              placeholder={field.placeholder || ''}
              required={field.required}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'LONG_TEXT':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
            </Label>
            <Textarea
              id={field.id}
              value={(value as string) || ''}
              onChange={(e) => updateResponse(field.id, e.target.value)}
              placeholder={field.placeholder || ''}
              required={field.required}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
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
            {error && <p className="text-sm text-destructive">{error}</p>}
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
            {error && <p className="text-sm text-destructive">{error}</p>}
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
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'CHECKBOX':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={(value as boolean) || false}
              onCheckedChange={(checked) => updateResponse(field.id, checked === true)}
              required={field.required}
            />
            <Label htmlFor={field.id} className="cursor-pointer">
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
            </Label>
            {error && <p className="text-sm text-destructive">{error}</p>}
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
            {error && <p className="text-sm text-destructive">{error}</p>}
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>{t('customFields.title')}</CardTitle>
        </div>
        <CardDescription>{t('customFields.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(renderField)}
          <Button type="submit" className="w-full">
            {t('customFields.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

