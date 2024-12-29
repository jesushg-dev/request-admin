import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { planInfoSchema } from './schemas';

type PlanInfoFormValues = z.infer<typeof planInfoSchema>;

export function PlanInfoStep() {
  const { control } = useFormContext<PlanInfoFormValues>();

  return (
    <div className="m-1 flex flex-col gap-2">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plan Name</FormLabel>
            <FormControl>
              <Input className="h-8 w-full rounded" placeholder="Enter plan name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea className="h-8 w-full rounded" placeholder="Enter plan description" {...field} />
            </FormControl>
            <FormDescription>Please provide a description for the plan</FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price</FormLabel>
            <FormControl>
              <Input className="h-8 w-full rounded" min={0} type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
            </FormControl>
            <FormDescription>Enter 0 for a free plan</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="durationInDays"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duration (in days)</FormLabel>
            <FormControl>
              <Input className="h-8 w-full rounded" min={1} type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
            </FormControl>
            <FormDescription>Leave empty for unlimited duration</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
