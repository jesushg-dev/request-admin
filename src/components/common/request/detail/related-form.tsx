'use client';

import { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertRelatedIncident } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';

const RelatedIncidentSchema = z.object({
  id: z.string(),
  relatedId: z.string().uuid(),
  isActive: z.boolean().default(true),
});

export type RelatedIncident = z.infer<typeof RelatedIncidentSchema>;

export const getDefaultValues = (): RelatedIncident => ({
  id: generateUuid(),
  relatedId: '',
  isActive: true,
});

interface RelatedIncidentFormProps {
  tenantId: string;
  requestId: string;
  initialValues?: RelatedIncident | null;
}

export function RelatedIncidentForm({ tenantId, requestId, initialValues }: RelatedIncidentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertRelatedIncident();

  const form = useForm<RelatedIncident>({
    resolver: zodResolver(RelatedIncidentSchema),
    defaultValues: initialValues ?? getDefaultValues(),
  });

  const onSubmit = ({ id, relatedId }: RelatedIncident) => {
    startTransition(async () => {
      const promise = upsert({
        create: { tenantId, requestId, relatedId },
        update: { tenantId, requestId, relatedId },
        where: { id },
      });

      toast.promise(promise, {
        loading: 'Saving changes...',
        success: (response) => {
          router.push({ pathname: '/admin/[tenantId]/requests-portal/requests/[slug]', params: { tenantId, slug: requestId } });
          return `Related incident (${response?.id}) has been saved successfully.`;
        },
        error: (error) => `Failed to save requirement: ${error.message}`,
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
              name="relatedId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Id</FormLabel>
                  <FormControl>
                    <Input placeholder="00000000-0000-0000-0000-000000000000" {...field} />
                  </FormControl>
                  <FormDescription>Type the id of the related incident.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end"></div>
        <Button type="submit" disabled={isPending}>
          {initialValues ? 'Save Changes' : 'Add Related Incident'}
          {isPending && <LoaderCircleIcon className="animate-spin" />}
        </Button>
      </form>
    </Form>
  );
}
