'use client';

import { useTransition, type FC } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertIdentificationType } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';

const identificationTypeFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(150, 'Name must be 150 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  regex: z.string().max(500, 'Regex must be 500 characters or less').optional(),
  testInput: z.string().max(500, 'Test input must be 500 characters or less').optional(),
});

type identificationTypeFormValues = z.infer<typeof identificationTypeFormSchema>;

const getDefaultValues = (): identificationTypeFormValues => ({
  id: generateUuid(),
  name: '',
  description: '',
  regex: '',
  testInput: '',
});

interface IdentificationTypeFormProps {
  tenantId: string;
  defaultValues?: identificationTypeFormValues;
}

export const IdentificationTypeForm: FC<IdentificationTypeFormProps> = ({ tenantId, defaultValues }) => {
  const router = useRouter();
  const form = useForm<identificationTypeFormValues>({
    resolver: zodResolver(identificationTypeFormSchema),
    defaultValues: defaultValues ?? getDefaultValues(),
    mode: 'onBlur',
  });

  const [pending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertIdentificationType();

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

  const onSubmit = (data: identificationTypeFormValues) => {
    startTransition(async () => {
      const promise = upsert({
        create: { ...data, tenantId },
        update: { ...data, tenantId },
        where: { id: data.id },
      });

      toast.promise(promise, {
        loading: 'Saving...',
        success: () => {
          router.push({ pathname: '/admin/[tenantId]/security/identification-types', params: { tenantId } });
          return 'Identification type saved successfully';
        },
        error: (err) => {
          return `Error saving identification type: ${err.message}`;
        },
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
        {error && <PrismaErrorAlert error={error} />}
        <div className="flex-1 overflow-auto">
          <div className="flex flex-1 flex-col justify-between overflow-hidden px-1 gap-4">
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
                          toast(isValid ? 'Regex Valid' : 'Regex Invalid', {
                            description: isValid ? 'The regex matches the test input.' : 'The regex does not match the test input.',
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
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
