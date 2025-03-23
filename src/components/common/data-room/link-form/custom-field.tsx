'use client';

import { FileText, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/shared/empty-state';

import { LinkFormValues } from '.';
import { CustomFieldRow, Section } from './shared';

export function CustomField() {
  const t = useTranslations('admin.link.form.customFields');
  const form = useFormContext<LinkFormValues>();
  // Use field array for custom fields
  const {
    fields: customFieldsFields,
    append: appendCustomField,
    remove: removeCustomField,
  } = useFieldArray({
    control: form.control,
    name: 'customFields',
  });

  const addCustomField = () => {
    appendCustomField({
      id: generateUuid(),
      type: 'SHORT_TEXT',
      label: '',
      placeholder: '',
      description: '',
      required: false,
      disabled: false,
    });
  };

  return (
    <Section title={t('title')} icon={<FileText className="h-4 w-4 text-primary" />} defaultOpen={true}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t('description')}</p>

        <div className="space-y-3">
          {customFieldsFields.map((field, index) => (
            <CustomFieldRow key={field.id} field={field} index={index} control={form.control} remove={removeCustomField} />
          ))}
        </div>

        {customFieldsFields.length === 0 && <EmptyState icons={[Plus]} title={t('emptyTitle')} description={t('emptyDescription')} />}

        <div className="flex justify-center mt-4">
          <Button type="button" variant="outline" onClick={addCustomField} className="w-full border border-dashed">
            <Plus className="h-4 w-4 mr-2" />
            {t('addButton')}
          </Button>
        </div>
      </div>
    </Section>
  );
}
