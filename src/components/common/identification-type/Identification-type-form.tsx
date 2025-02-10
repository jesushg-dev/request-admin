'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150, 'Name must be 150 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  regex: z.string().max(500, 'Regex must be 500 characters or less').optional(),
  testInput: z.string().max(500, 'Test input must be 500 characters or less').optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function IdentificationTypeForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      regex: '',
      testInput: '',
    },
  });

  const validateRegex = (regex: string | undefined, testInput: string | undefined) => {
    if (!regex || !testInput) {
      return null;
    }

    try {
      const regexObj = new RegExp(regex);
      return regexObj.test(testInput);
    } catch {
      return false;
    }
  };

  const onSubmit = (data: FormValues) => {
    console.log('Form submitted:', data);
    toast('Form Submitted', { description: 'The identification type has been successfully added.' });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter identification type name" {...field} />
              </FormControl>
              <FormDescription>The name of the identification type (e.g., &quot;Passport&quot;)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter description (optional)" className="resize-none" {...field} />
              </FormControl>
              <FormDescription>Optional description of the identification type</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="regex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Regex Validation</FormLabel>
              <FormControl>
                <Input placeholder="Enter regex for validation (optional)" {...field} />
              </FormControl>
              <FormDescription>Optional regex to validate the identification number</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="testInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Input</FormLabel>
              <div className="flex space-x-2">
                <FormControl>
                  <Input placeholder="Enter test input for regex" {...field} />
                </FormControl>
                <Button
                  type="button"
                  onClick={() => {
                    const regex = form.getValues('regex');
                    const testInput = form.getValues('testInput');
                    if (!regex || !testInput) {
                      return;
                    }

                    const isValid = validateRegex(regex, testInput);
                    if (isValid !== null) {
                      toast({
                        title: isValid ? 'Regex Valid' : 'Regex Invalid',
                        description: isValid ? 'The regex matches the test input.' : 'The regex does not match the test input.',
                        variant: isValid ? 'default' : 'destructive',
                      });
                    }
                  }}
                  disabled={!form.getValues('regex') || !form.getValues('testInput')}>
                  Test
                </Button>
              </div>
              <FormDescription>Enter a test input to validate against the regex</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.getValues('regex') && form.getValues('testInput') && (
          <div className={`flex items-center space-x-2 ${validateRegex(form.getValues('regex'), form.getValues('testInput')) ? 'text-green-600' : 'text-red-600'}`}>
            {validateRegex(form.getValues('regex'), form.getValues('testInput')) ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span>{validateRegex(form.getValues('regex'), form.getValues('testInput')) ? 'Regex is valid' : 'Regex is invalid'}</span>
          </div>
        )}
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
