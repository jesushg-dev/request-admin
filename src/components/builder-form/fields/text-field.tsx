'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { TypeIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { cn } from '@/lib/utils';
import useDesigner from '@/hooks/use-designer';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ElementsType, FormElement, FormElementInstance, SubmitFunction } from '@/components/builder-form/form-elements';
import { useTextFieldPropertiesSchema, type TTextFieldPropertiesSchema } from '@/services/schemas/builder-form/fields';

const type: ElementsType = 'TextField';

const extraAttributes = {
  label: 'Text field',
  helperText: 'Helper text',
  required: false,
  placeHolder: 'Value here...',
};

export const TextFieldFormElement: FormElement = {
  type,
  construct: (id: string) => {
    // Use default English values - they will be translated when rendered
    // This is a tradeoff since construct is not a React component
    return {
      id,
      type,
      extraAttributes,
    };
  },
  designerBtnElement: {
    icon: TypeIcon,
    label: 'Campo de Texto',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    if (element.extraAttributes.required) {
      return currentValue.length > 0;
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
  const { required, placeHolder } = element.extraAttributes;
  
  // Translate default values, otherwise use custom user values
  const label = element.extraAttributes.label === extraAttributes.label ? tDefaults('textFieldLabel') : element.extraAttributes.label;
  const helperText = element.extraAttributes.helperText === extraAttributes.helperText ? tDefaults('textFieldHelperText') : element.extraAttributes.helperText;
  
  return (
    <div className="flex w-full flex-col gap-2">
      <Label>
        {label}
        {required && '*'}
      </Label>
      <Input readOnly disabled placeholder={placeHolder} />
      {helperText && <p className="text-muted-foreground text-[0.8rem]">{helperText}</p>}
    </div>
  );
}

function FormComponent({ elementInstance, submitValue, isInvalid, defaultValue }: { elementInstance: FormElementInstance; submitValue?: SubmitFunction; isInvalid?: boolean; defaultValue?: string }) {
  const element = elementInstance as CustomInstance;
  const tDefaults = useTranslations('component.form.builderFields.defaults');

  const [value, setValue] = useState(defaultValue || '');
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { required, placeHolder } = element.extraAttributes;
  
  // Translate default values, otherwise use custom user values
  const label = element.extraAttributes.label === extraAttributes.label ? tDefaults('textFieldLabel') : element.extraAttributes.label;
  const helperText = element.extraAttributes.helperText === extraAttributes.helperText ? tDefaults('textFieldHelperText') : element.extraAttributes.helperText;
  
  return (
    <div className="flex w-full flex-col gap-2">
      <Label className={cn(error && 'text-red-500')}>
        {label}
        {required && '*'}
      </Label>
      <Input
        className={cn(error && 'border-red-500')}
        placeholder={placeHolder}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => {
          if (!submitValue) return;
          const valid = TextFieldFormElement.validate(element, e.target.value);
          setError(!valid);
          if (!valid) return;
          submitValue(element.id, e.target.value);
        }}
        value={value}
      />
      {helperText && <p className={cn('text-muted-foreground text-[0.8rem]', error && 'text-red-500')}>{helperText}</p>}
    </div>
  );
}

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesigner();
  const t = useTranslations('component.form.builderFields.common');
  const propertiesSchema = useTextFieldPropertiesSchema();
  const form = useForm<TTextFieldPropertiesSchema>({
    resolver: zodResolver(propertiesSchema),
    mode: 'onBlur',
    defaultValues: {
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      required: element.extraAttributes.required,
      placeHolder: element.extraAttributes.placeHolder,
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(values: TTextFieldPropertiesSchema) {
    const { label, helperText, placeHolder, required } = values;
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        label,
        helperText,
        placeHolder,
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
          name="placeHolder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('placeholder')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>{t('placeholderDescription')}</FormDescription>
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
                  {t('requiredDescription')}
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
