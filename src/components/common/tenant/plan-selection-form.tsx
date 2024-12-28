import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Plan, PlanSelectionData } from './types';

interface PlanSelectionFormProps {
  plans: Plan[];
}

export function PlanSelectionForm({ plans }: PlanSelectionFormProps) {
  const { control } = useFormContext<PlanSelectionData>();

  return (
    <FormField
      control={control}
      name="planId"
      render={({ field }) => (
        <FormItem className="mx-1 flex flex-col gap-2">
          <FormControl>
            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
              {plans.map((plan) => (
                <FormItem className="flex items-center space-x-3 space-y-0" key={plan.id}>
                  <FormControl>
                    <RadioGroupItem value={plan.id} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    <span className="font-medium">{plan.name}</span> - ${plan.price}
                    {plan.durationInDays && ` / ${plan.durationInDays} days`}
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
