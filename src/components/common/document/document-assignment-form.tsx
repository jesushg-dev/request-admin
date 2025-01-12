'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export interface DocumentAssignment {
  id?: string;
  name?: string;
  status?: string;
  requestAssignmentId: string;
}

const formSchema = z.object({
  name: z.string().max(50, 'Name must be 50 characters or less').optional(),
  status: z.string().max(50, 'Status must be 50 characters or less').optional(),
  requestAssignmentId: z.string().uuid('Must be a valid UUID'),
});

export function DocumentAssignmentForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      status: '',
      requestAssignmentId: '',
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    console.log('🚀 ~ handleSubmit ~ data:', data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Document assignment name" {...field} />
              </FormControl>
              <FormDescription>The name of the document assignment (optional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Input placeholder="Status" {...field} />
              </FormControl>
              <FormDescription>The status of the document assignment (optional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requestAssignmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Request Assignment ID</FormLabel>
              <FormControl>
                <Input placeholder="UUID" {...field} />
              </FormControl>
              <FormDescription>The ID of the associated request assignment.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
