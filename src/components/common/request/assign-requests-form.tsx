'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, X } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ===================
// Type Definitions
// ===================
export interface User {
  id: string;
  name: string;
}

export interface Request {
  id: string;
  title: string;
}

// Updated to wrap requestId in an object
export interface IFormInput {
  userId: string;
  requestIds: { requestId: string }[];
}

// ===================
// Mock Data
// ===================
const users: User[] = [
  { id: '1', name: 'User 1' },
  { id: '2', name: 'User 2' },
  { id: '3', name: 'User 3' },
];

const requests: Request[] = [
  { id: '1', title: 'Request 1' },
  { id: '2', title: 'Request 2' },
  { id: '3', title: 'Request 3' },
  { id: '4', title: 'Request 4' },
  { id: '5', title: 'Request 5' },
];

// ===================
// Zod Schema
// ===================
const formSchema = z.object({
  userId: z.string().min(1, { message: 'error.userRequired' }),
  requestIds: z
    .array(
      z.object({
        requestId: z.string().min(1, { message: 'error.requestRequired' }),
      })
    )
    .min(1, { message: 'error.requestRequired' }),
});

export type AssignRequestsFormValues = z.infer<typeof formSchema>;

// ===================
// Component
// ===================
export default function AssignRequestsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with the Zod schema resolver and default values
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      requestIds: [{ requestId: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'requestIds',
  });

  async function onSubmit(values: AssignRequestsFormValues) {
    setIsSubmitting(true);
    console.log(values);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
        {/*error && <PrismaErrorAlert error={error} />*/}
        <div className="flex-1 overflow-auto">
          <div className="flex flex-1 flex-col justify-between overflow-hidden px-1 gap-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{'assignRequests.user'}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="assignRequests.userPlaceholder" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Request Fields */}
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`requestIds.${index}.requestId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{index === 0 ? 'assignRequests.requests' : `assignRequests.request ${index + 1}`}</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="assignRequests.requestPlaceholder" />
                          </SelectTrigger>
                          <SelectContent>
                            {requests.map((request) => (
                              <SelectItem key={request.id} value={request.id}>
                                {request.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      {index > 0 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          {/* Button to add another request */}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ requestId: '' })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {'assignRequests.addRequest'}
          </Button>

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'assignRequests.saving' : 'assignRequests.submit'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
