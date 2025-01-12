'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export interface Document {
  name: string;
  url?: string;
  status: number;
  requirementComplianceTrackingId?: string;
  requestId: string;
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(155, 'Name must be 155 characters or less'),
  url: z.string().url('Must be a valid URL').max(500, 'URL must be 500 characters or less').optional().or(z.literal('')),
  status: z.number().int().min(0, 'Status must be a positive integer'),
  requirementComplianceTrackingId: z.string().uuid('Must be a valid UUID').optional().or(z.literal('')),
  requestId: z.string().uuid('Must be a valid UUID'),
});

export function DocumentForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      url: '',
      status: 0,
      requirementComplianceTrackingId: '',
      requestId: '',
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log('🚀 ~ handleSubmit ~ data:', data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between overflow-hidden p-6 pt-0">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Document name" {...field} />
              </FormControl>
              <FormDescription>The name of the document.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/document" {...field} />
              </FormControl>
              <FormDescription>The URL where the document is located (optional).</FormDescription>
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
                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
              </FormControl>
              <FormDescription>The status code of the document.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requirementComplianceTrackingId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirement Compliance Tracking ID</FormLabel>
              <FormControl>
                <Input placeholder="UUID" {...field} />
              </FormControl>
              <FormDescription>The ID of the associated compliance tracking (optional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requestId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Request ID</FormLabel>
              <FormControl>
                <Input placeholder="UUID" {...field} />
              </FormControl>
              <FormDescription>The ID of the associated request.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
