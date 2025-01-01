'use client';

import { useFormContext } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type FormElementType = 'text' | 'textarea' | 'select';

interface FormElement {
  id: string;
  type: FormElementType;
  label: string;
  options?: string[];
}

interface DynamicFormStepProps {
  formElements: FormElement[];
}

const FormElementComponent: React.FC<{ element: FormElement }> = ({ element }) => {
  const { register } = useFormContext();

  switch (element.type) {
    case 'text':
      return <Input id={element.id} {...register(`dynamicForm.${element.id}`)} />;
    case 'textarea':
      return <Textarea id={element.id} {...register(`dynamicForm.${element.id}`)} />;
    case 'select':
      return (
        <Select onValueChange={(value) => register(`dynamicForm.${element.id}`).onChange({ target: { value } })}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${element.label}`} />
          </SelectTrigger>
          <SelectContent>
            {element.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    default:
      return null;
  }
};

export default function DynamicFormStep({ formElements }: DynamicFormStepProps) {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <div className="m-1 flex flex-col gap-2">
      {formElements.map((element) => (
        <div key={element.id} className="space-y-2">
          <Label htmlFor={element.id}>{element.label}</Label>
          <FormElementComponent element={element} />
        </div>
      ))}
    </div>
  );
}
