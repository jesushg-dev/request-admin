import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

export const hierarchySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(255, 'Description must be 255 characters or less').optional(),
  isActive: z.boolean().optional(),
});

export type HierarchyFormValues = z.infer<typeof hierarchySchema>;

export const getDefaultHierarchyFormValues = (): HierarchyFormValues => ({
  id: '',
  name: '',
  description: '',
  isActive: true,
});

export function HierarchyForm() {
  const { control } = useFormContext<HierarchyFormValues>();

  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Hierarchy Details</h3>
        <p className="text-sm text-muted-foreground">Provide a name and description for your hierarchy.</p>
      </div>

      <ScrollArea className="w-full flex-1 overflow-y-hidden">
        <div className="flex flex-col gap-2 flex-1 m-1">
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
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Is Active</FormLabel>
                  <FormDescription>If the hierarchy is active, it will be available for use in the application.</FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
