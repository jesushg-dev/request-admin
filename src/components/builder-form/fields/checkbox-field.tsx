'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SquareCheckIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { cn } from '@/lib/utils';
import useDesigner from '@/hooks/use-designer';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ElementsType, FormElement, FormElementInstance, SubmitFunction } from '@/components/builder-form/form-elements';
import { useCheckboxFieldPropertiesSchema, type TCheckboxFieldPropertiesSchema } from '@/services/schemas/builder-form/fields';

const type: ElementsType = 'CheckboxField';

const extraAttributes = {
  label: 'Checkbox field',
  helperText: 'Helper text',
  required: false,
};

export const CheckboxFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: SquareCheckIcon,
    label: 'Campo de Casilla',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    if (element.extraAttributes.required) {
      return currentValue === 'true';
    }

    return true;
  },
};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const tDefaults = useTranslations('component.form.builderFields.defaults');
  const { required } = element.extraAttributes;
  const id = `checkbox-${element.id}`;
  
  // Translate default values, otherwise use custom user values
  const label = element.extraAttributes.label === extraAttributes.label ? tDefaults('checkboxFieldLabel') : element.extraAttributes.label;
  const helperText = element.extraAttributes.helperText === extraAttributes.helperText ? tDefaults('checkboxFieldHelperText') : element.extraAttributes.helperText;
  
  return (
    <div className="items-top flex space-x-2">
      <Checkbox id={id} />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor={id}>
          {label}
          {required && '*'}
        </Label>
        {helperText && <p className="text-muted-foreground text-[0.8rem]">{helperText}</p>}
      </div>
    </div>
  );
}

function FormComponent({ elementInstance, submitValue, isInvalid, defaultValue }: { elementInstance: FormElementInstance; submitValue?: SubmitFunction; isInvalid?: boolean; defaultValue?: string }) {
  const element = elementInstance as CustomInstance;
  const tDefaults = useTranslations('component.form.builderFields.defaults');

  const [value, setValue] = useState<boolean>(defaultValue === 'true' ? true : false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { required } = element.extraAttributes;
  
  // Translate default values, otherwise use custom user values
  const label = element.extraAttributes.label === extraAttributes.label ? tDefaults('checkboxFieldLabel') : element.extraAttributes.label;
  const helperText = element.extraAttributes.helperText === extraAttributes.helperText ? tDefaults('checkboxFieldHelperText') : element.extraAttributes.helperText;
  const id = `checkbox-${element.id}`;
  return (
    <div className="items-top flex space-x-2">
      <Checkbox
        id={id}
        checked={value}
        className={cn(error && 'border-red-500')}
        onCheckedChange={(checked) => {
          let value = false;
          if (checked === true) value = true;

          setValue(value);
          if (!submitValue) return;
          const stringValue = value ? 'true' : 'false';
          const valid = CheckboxFieldFormElement.validate(element, stringValue);
          setError(!valid);
          submitValue(element.id, stringValue);
        }}
      />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor={id} className={cn(error && 'text-red-500')}>
          {label}
          {required && '*'}
        </Label>
        {helperText && <p className={cn('text-muted-foreground text-[0.8rem]', error && 'text-red-500')}>{helperText}</p>}
      </div>
    </div>
  );
}

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesigner();
  const t = useTranslations('component.form.builderFields.common');
  const propertiesSchema = useCheckboxFieldPropertiesSchema();
  const form = useForm<TCheckboxFieldPropertiesSchema>({
    resolver: zodResolver(propertiesSchema),
    mode: 'onBlur',
    defaultValues: {
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      required: element.extraAttributes.required,
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(values: TCheckboxFieldPropertiesSchema) {
    const { label, helperText, required } = values;
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        label,
        helperText,
        required,
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="space-y-3">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('label')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>
                {t('labelDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="helperText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('helperText')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>
                {t('helperTextDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel>{t('required')}</FormLabel>
                <FormDescription>
                  The helper text of the field. <br />
                  It will be displayed below the field.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
