import { useFormContext } from 'react-hook-form';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { HierarchyFormValues } from './schemas';

export function HierarchyStep() {
  const { control } = useFormContext<HierarchyFormValues>();

  return (
    <div className="m-1 flex flex-col gap-2">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hierarchy Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter hierarchy name" {...field} />
            </FormControl>
            <FormDescription>The name of your hierarchy (e.g., &quot;Sales Channel Hierarchy&quot;)</FormDescription>
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
              <Textarea placeholder="Enter a description for this hierarchy" {...field} />
            </FormControl>
            <FormDescription>Optional: Provide a brief description of the hierarchy</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hierarchy Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a hierarchy type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Request">Request</SelectItem>
                <SelectItem value="Assignation">Assignation</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>Choose the type of hierarchy you&apos;re creating</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
