'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateApiKeyAction } from '@/actions/api-key';
import { useApiKeyFormSchema, type TApiKeyFormSchema } from '@/services/schemas/settings/api-key.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { JsonInput } from '@/components/custom-ui/json-input';

type ApiKeyEditFormValues = Partial<TApiKeyFormSchema> & {
  enabled?: boolean;
};

interface ApiKeyEditFormProps {
  keyId: string;
  defaultValues: {
    name?: string | null;
    enabled?: boolean | null;
    rateLimitEnabled?: boolean | null;
    rateLimitMax?: number | null;
    rateLimitTimeWindow?: number | null;
    remaining?: number | null;
    refillAmount?: number | null;
    refillInterval?: number | null;
    metadata?: unknown;
  };
  onSuccess?: () => void;
}

export function ApiKeyEditForm({ keyId, defaultValues, onSuccess }: ApiKeyEditFormProps) {
  const t = useTranslations('admin.setting.apiKeys.editForm');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const apiKeyFormSchema = useApiKeyFormSchema();

  // Extract existing metadata and preserve tenantId
  const existingMetadata = (typeof defaultValues.metadata === 'object' && defaultValues.metadata !== null ? defaultValues.metadata : {}) as Record<string, unknown>;
  const existingTenantId = existingMetadata.tenantId as string | undefined;

  const form = useForm<ApiKeyEditFormValues>({
    mode: 'onChange',
    resolver: zodResolver(apiKeyFormSchema.partial()),
    defaultValues: {
      name: defaultValues.name ?? '',
      enabled: defaultValues.enabled ?? true,
      rateLimitEnabled: defaultValues.rateLimitEnabled ?? false,
      rateLimitMax: defaultValues.rateLimitMax ?? 100,
      rateLimitTimeWindow: defaultValues.rateLimitTimeWindow ?? 60000,
      remaining: defaultValues.remaining ?? undefined,
      refillAmount: defaultValues.refillAmount ?? undefined,
      refillInterval: defaultValues.refillInterval ?? undefined,
      metadata: existingMetadata,
    },
  });

  const onSubmit = async (values: ApiKeyEditFormValues) => {
    startTransition(async () => {
      const toastId = toast.loading(t('updating'));
      try {
        // Ensure tenantId is preserved in metadata (backend will also enforce this)
        const metadataToSend = { ...(values.metadata || {}) };
        if (existingTenantId) {
          metadataToSend.tenantId = existingTenantId;
        }

        await updateApiKeyAction({
          keyId,
          name: values.name,
          enabled: values.enabled,
          rateLimitEnabled: values.rateLimitEnabled,
          rateLimitMax: values.rateLimitMax,
          rateLimitTimeWindow: values.rateLimitTimeWindow,
          remaining: values.remaining,
          refillAmount: values.refillAmount,
          refillInterval: values.refillInterval,
          metadata: metadataToSend,
        });

        toast.success(t('updateSuccess'), { id: toastId });
        onSuccess?.();
        router.back();
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'N/A';
        toast.error(t('updateError', { error: message }), { id: toastId });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="flex flex-1 flex-col justify-between overflow-hidden px-1 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('name.placeholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('name.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('enabled.label')}</FormLabel>
                    <FormDescription>{t('enabled.description')}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rateLimitEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('rateLimit.label')}</FormLabel>
                    <FormDescription>{t('rateLimit.description')}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('rateLimitEnabled') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rateLimitMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rateLimit.maxRequests')}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription>{t('rateLimit.maxRequestsDesc')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rateLimitTimeWindow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rateLimit.timeWindow')}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="60000" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription>{t('rateLimit.timeWindowDesc')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="remaining"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('usageLimits.remaining')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1000" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} value={field.value ?? ''} />
                    </FormControl>
                    <FormDescription>{t('usageLimits.remainingDesc')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="refillAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('usageLimits.refillAmount')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} value={field.value ?? ''} />
                    </FormControl>
                    <FormDescription>{t('usageLimits.refillAmountDesc')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="refillInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('usageLimits.refillInterval')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="3600000" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} value={field.value ?? ''} />
                    </FormControl>
                    <FormDescription>{t('usageLimits.refillIntervalDesc')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="metadata"
              render={({ field }) => {
                // Remove tenantId from display to prevent modification
                const displayValue = { ...(field.value ?? {}) };
                const hasTenantId = 'tenantId' in displayValue;
                if (hasTenantId) {
                  delete displayValue.tenantId;
                }

                return (
                  <FormItem>
                    <FormLabel>{t('metadata.label')}</FormLabel>
                    <FormControl>
                      <JsonInput
                        value={displayValue}
                        onChange={(value) => {
                          // Automatically preserve tenantId when updating
                          // Ensure value is an object before spreading
                          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                            const newValue = { ...value } as Record<string, unknown>;
                            if (existingTenantId) {
                              newValue.tenantId = existingTenantId;
                            }
                            field.onChange(newValue);
                          } else {
                            const newValue: Record<string, unknown> = {};
                            if (existingTenantId) {
                              newValue.tenantId = existingTenantId;
                            }
                            field.onChange(newValue);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>{hasTenantId ? `${t('metadata.description')} (Note: tenantId is protected and cannot be modified)` : t('metadata.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? t('updating') : t('updateButton')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
