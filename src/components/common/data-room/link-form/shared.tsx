'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckSquare, ChevronDown, ChevronUp, FileText, Hash, Link2, List, ListFilter, Phone, Trash2, Type } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Control } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Hint } from '@/components/hint';

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

// Section component with collapsible functionality
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Section = ({ title, icon, children, defaultOpen = true }: SectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-sm overflow-hidden">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors">
        <div className="flex items-center text-sm font-medium">
          {icon}
          <span className="ml-2">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
    <div className="p-3 border rounded-md bg-muted/10 hover:bg-muted/20 transition-colors flex flex-col gap-2">
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

// Compact switch component for consistent styling
interface CompactSwitchProps {
  label: string;
  icon?: React.ReactNode;
  tooltip?: string;
  field: { value: boolean; onChange: (value: boolean) => void };
}

export const CompactSwitch = ({ label, icon, tooltip, field }: CompactSwitchProps) => {
  return (
    <FormItem className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FormLabel className="font-medium cursor-pointer flex items-center gap-1.5 m-0">
          {icon && <span className="text-primary mr-1.5">{icon}</span>}
          {label}

          {tooltip && (
            <Hint label={tooltip}>
              <span className="text-muted-foreground cursor-help rounded-full border h-4 w-4 flex items-center justify-center text-xs">?</span>
            </Hint>
          )}
        </FormLabel>
      </div>
      <FormControl>
        <Switch checked={field.value} onCheckedChange={field.onChange} />
      </FormControl>
    </FormItem>
  );
};
