'use client';

import { ElementsType, FormElement, FormElementInstance } from '@/components/builder-form/form-elements';
import { Label } from '@/components/ui/label';

import { RiSeparator } from 'react-icons/ri';
import { Separator } from '@/components/ui/separator';

const type: ElementsType = 'SeparatorField';

export const SeparatorFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
  }),
  designerBtnElement: {
    icon: RiSeparator,
    label: 'Separator field',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: () => true,
};

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Label className="text-muted-foreground">Separator field</Label>
      <Separator />
    </div>
  );
}

function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  return <Separator />;
}

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  return <p>No properties for this element</p>;
}
