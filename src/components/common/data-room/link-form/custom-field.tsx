'use client';

import { CheckSquare, FileText, Hash, Link2, List, ListFilter, Phone, Plus, Trash2, Type } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Control, useFieldArray, useFormContext } from 'react-hook-form';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AccordionSection } from '@/components/shared/accordion-section';
import EmptyState from '@/components/shared/empty-state';

import { LinkFormValues } from '.';

// Field type options with icons
const fieldTypeOptions = [
  { value: 'SHORT_TEXT', label: 'Texto Corto', icon: <Type className="h-4 w-4" /> },
  { value: 'LONG_TEXT', label: 'Texto Largo', icon: <FileText className="h-4 w-4" /> },
  { value: 'NUMBER', label: 'Número', icon: <Hash className="h-4 w-4" /> },
  { value: 'PHONE_NUMBER', label: 'Teléfono', icon: <Phone className="h-4 w-4" /> },
  { value: 'URL', label: 'URL', icon: <Link2 className="h-4 w-4" /> },
  { value: 'CHECKBOX', label: 'Casilla', icon: <CheckSquare className="h-4 w-4" /> },
  { value: 'SELECT', label: 'Selección', icon: <List className="h-4 w-4" /> },
  { value: 'MULTI_SELECT', label: 'Selección Múltiple', icon: <ListFilter className="h-4 w-4" /> },
];

// Custom field row component
interface CustomFieldRowProps {
  field: { id: string };
  index: number;
  control: Control<LinkFormValues>;
  remove: (index: number) => void;
}

export const CustomFieldRow = ({ field, index, control, remove }: CustomFieldRowProps) => {
  const t = useTranslations('admin.link.form.customFields.row');
  return (
    <div className="p-4 border rounded-lg bg-muted/10 hover:bg-muted/20 transition-all shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <FormField control={control} name={`customFields.${index}.label`} render={({ field: labelField }) => <Input {...labelField} placeholder={t('labelPlaceholder')} className="flex-1" />} />

        <div className="flex items-center gap-3 ml-auto">
          <FormField
            control={control}
            name={`customFields.${index}.required`}
            render={({ field: requiredField }) => (
              <div className="flex items-center gap-1">
                <Switch checked={requiredField.value} onCheckedChange={requiredField.onChange} id={`field-${field.id}-required`} />
                <Label htmlFor={`field-${field.id}-required`} className="text-xs">
                  {t('requiredLabel')}
                </Label>
              </div>
            )}
          />

          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <FormField
            control={control}
            name={`customFields.${index}.type`}
            render={({ field: typeField }) => (
              <Select value={typeField.value} onValueChange={typeField.onChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue>
                    <div className="flex items-center">
                      {fieldTypeOptions.find((option) => option.value === typeField.value)?.icon}
                      <span className="ml-2">{fieldTypeOptions.find((option) => option.value === typeField.value)?.label || t('typeFallback')}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {fieldTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        {option.icon}
                        <span className="ml-2">{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <FormField
            control={control}
            name={`customFields.${index}.placeholder`}
            render={({ field: placeholderField }) => <Input {...placeholderField} placeholder={t('placeholder')} className="flex-1" />}
          />
        </div>

        <FormField
          control={control}
          name={`customFields.${index}.description`}
          render={({ field: descriptionField }) => <Input {...descriptionField} placeholder={t('description')} className="flex-1" />}
        />
      </div>
    </div>
  );
};

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
    <AccordionSection title={t('title')} icon={<FileText className="h-4 w-4 text-primary" />} defaultOpen={true}>
      <div className="space-y-4 p-1">
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
    </AccordionSection>
  );
}
