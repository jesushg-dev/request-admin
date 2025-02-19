import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export const planSelectionSchema = z.object({
  planId: z.string().min(1, 'Plan selection is required'),
});

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationInDays?: number;
}

export type PlanSelectionData = z.infer<typeof planSelectionSchema>;

interface PlanSelectionFormProps {
  plans: Plan[];
}

export function PlanSelectionStep({ plans }: PlanSelectionFormProps) {
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
                <FormItem className="flex items-center space-y-0 space-x-3" key={plan.id}>
                  <FormControl>
                    <RadioGroupItem value={plan.id} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    <span className="font-medium">{plan.name}</span> - ${plan.price}
                    {plan.durationInDays && ` / ${plan.durationInDays} days`}
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
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
