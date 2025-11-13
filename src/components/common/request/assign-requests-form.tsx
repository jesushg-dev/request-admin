'use client';

import { useState, useEffect } from 'react';
import { assignRequestsMassively, getAvailableRequestsForUser, getTenantUsers } from '@/actions/request-assignment';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useTenantContext } from '@/components/hoc/tenant-provider';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { FormActions, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';
import { Textarea } from '@/components/ui/textarea';
import Select, { type OptionType } from '@/components/custom-ui/select';
import { useAssignRequestsSchema, type TAssignRequestsSchema } from '@/services/schemas/request';

// ===================
// Type Definitions
// ===================
export interface Request {
  id: string;
  slug: number | null;
  title: string;
  status: string;
  priority: string;
}

// ===================
// Component
// ===================
export default function AssignRequestsForm() {
  const { tenantId } = useTenantContext();
  const t = useTranslations('admin.request.massiveAssign');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<OptionType[]>([]);
  const [availableRequests, setAvailableRequests] = useState<Request[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const formSchema = useAssignRequestsSchema();

  // Initialize the form with the Zod schema resolver and default values
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: { label: '', value: '' },
      requestIds: [{ requestId: { label: '', value: '' } }],
      comments: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'requestIds',
  });

  const selectedUserId = form.watch('userId');

  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const usersData = await getTenantUsers(tenantId);
        setUsers(usersData);
      } catch (error) {
        toast.error('Error loading users');
        console.error(error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [tenantId]);

  // Load available requests when user is selected
  useEffect(() => {
    if (!selectedUserId?.value) {
      setAvailableRequests([]);
      return;
    }

    const loadRequests = async () => {
      setIsLoadingRequests(true);
      try {
        const requests = await getAvailableRequestsForUser(tenantId, selectedUserId.value);
        setAvailableRequests(requests);
      } catch (error) {
        toast.error('Error loading available requests');
        console.error(error);
      } finally {
        setIsLoadingRequests(false);
      }
    };

    loadRequests();
  }, [selectedUserId?.value, tenantId]);

  async function onSubmit(values: TAssignRequestsSchema) {
    setIsSubmitting(true);
    try {
      const requestIds = values.requestIds.map((r) => r.requestId.value);
      const results = await assignRequestsMassively(tenantId, values.userId.value, requestIds, values.comments);

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.length - successCount;

      if (failCount === 0) {
        toast.success(`Successfully assigned ${successCount} request(s)`);
      } else {
        toast.warning(`Assigned ${successCount} request(s), ${failCount} failed`);
      }

      form.reset();
      setAvailableRequests([]);
    } catch (error) {
      toast.error('Error assigning requests');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedValues = fields.map((_, idx) => form.getValues(`requestIds.${idx}.requestId.value`));

  const availableOptions = availableRequests.map((req) => ({
    label: `#${req.slug ?? req.id.slice(0, 8)} - ${req.title}`,
    value: req.id,
    priority: req.priority,
    status: req.status,
  }));

  return (
    <Form {...form}>
      <FormRoot onSubmit={form.handleSubmit(onSubmit)}>
        <FormContent>
          <FormSection>
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem label={t('user')} description={t('userDescription')} className="mb-2">
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    options={users}
                    placeholder={t('userPlaceholder')}
                    isSearchable
                    isLoading={isLoadingUsers}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                </FormItem>
              )}
            />

            {isLoadingRequests && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            )}

            {availableRequests.length > 0 && (
              <>
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`requestIds.${index}.requestId`}
                    render={({ field }) => (
                      <FormItem className="mb-2 w-full" label={index === 0 ? t('requests') : `${t('request')} ${index + 1}`}>
                        <div className="flex items-center gap-2 w-full">
                           <Select
                             value={field.value}
                             onChange={field.onChange}
                             options={availableOptions.filter(
                               (opt) => !selectedValues.includes(opt.value) || opt.value === field.value?.value
                             )}
                             placeholder={t('requestPlaceholder')}
                             isSearchable
                             className="w-full"
                             styles={{
                               menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                             }}
                           />
                          {fields.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                ))}

                <Button
                  type="button"
                  variant="dashed-outline"
                  size="sm"
                  className="w-full"
                  onClick={() => append({ requestId: { label: '', value: '' } })}
                  disabled={selectedValues.length >= availableRequests.length}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('addRequest')}
                </Button>
              </>
            )}

            {selectedUserId?.value && availableRequests.length === 0 && !isLoadingRequests && (
              <div className="text-center text-muted-foreground py-8">{t('noRequests')}</div>
            )}

            {selectedUserId?.value && availableRequests.length > 0 && (
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem className="mb-2" label={t('comments')} description={t('commentsDescription')}>
                    <Textarea placeholder={t('commentsPlaceholder')} rows={3} {...field} />
                  </FormItem>
                )}
              />
            )}
          </FormSection>
        </FormContent>
        <FormActions isPending={isSubmitting} title={t('submit')} />
      </FormRoot>
    </Form>
  );
}
