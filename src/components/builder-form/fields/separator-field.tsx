'use client';

import { MinusIcon } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ElementsType, FormElement, FormElementInstance } from '@/components/builder-form/form-elements';

const type: ElementsType = 'SeparatorField';

export const SeparatorFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
  }),
  designerBtnElement: {
    icon: MinusIcon,
    label: 'Separator field',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: () => true,
};

function DesignerComponent({}: { elementInstance: FormElementInstance }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Label className="text-muted-foreground">Separator field</Label>
      <Separator />
    </div>
  );
}

function FormComponent({}: { elementInstance: FormElementInstance }) {
  return <Separator />;
}

function PropertiesComponent({}: { elementInstance: FormElementInstance }) {
  return <p>No properties for this element</p>;
}
