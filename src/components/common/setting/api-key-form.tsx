'use client';

import { useState, useTransition } from 'react';
import { Link } from '@/i18n/routing';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { JsonInput } from '@/components/custom-ui/json-input';
import { createApiKeyAction } from '@/actions/api-key';
import { useApiKeyFormSchema, type TApiKeyFormSchema } from '@/services/schemas/settings/api-key.schema';

export const getApiKeyDefaultValues = (): ApiKeyFormValues => ({
  name: '',
  prefix: '',
  expiresIn: '7d',
  metadata: {},
  rateLimitEnabled: false,
  rateLimitMax: 100,
  rateLimitTimeWindow: 60000,
  remaining: undefined,
  refillAmount: undefined,
  refillInterval: undefined,
});

export type ApiKeyFormValues = TApiKeyFormSchema;

interface ApiKeyCreateFormProps {
  tenantId: string;
  defaultValues?: ApiKeyFormValues | null;
}

export function ApiKeyCreateForm({ defaultValues, tenantId }: ApiKeyCreateFormProps) {
  const t = useTranslations('admin.setting.apiKeys.createForm');
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const apiKeyFormSchema = useApiKeyFormSchema();

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: defaultValues || getApiKeyDefaultValues(),
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('copySuccess'));
  };

  const onSubmit = async (values: ApiKeyFormValues) => {
    startTransition(async () => {
      const toastId = toast.loading(t('creating'));
      try {
        const apiKey = await createApiKeyAction(values);

        if (!apiKey?.key) {
          throw new Error('API key missing from response');
        }

        setNewApiKey(apiKey.key);
        toast.success(t('createSuccess'), { id: toastId });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'N/A';
        toast.error(t('createError', { error: message }), { id: toastId });
      }
    });
  };

  if (newApiKey) {
    return (
      <div className="mb-6 p-4 border rounded-md bg-yellow-50 dark:bg-yellow-900/20 w-full">
        <div className="flex items-center mb-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2" />
          <h3 className="font-medium">{t('newKeyAlert.title')}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{t('newKeyAlert.warning')}</p>
        <div className="flex items-center space-x-2">
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold flex-1 overflow-x-auto">{newApiKey}</code>
          <Button variant="ghost">
            <Link
              href={{
                pathname: '/admin/[tenantId]/settings/security/api-keys',
                params: { tenantId },
              }}>
              {t('newKeyAlert.manageKeys')}
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(newApiKey)} aria-label="Copy API Key">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

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
              name="prefix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('prefix.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('prefix.placeholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('prefix.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('expiration.label')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('expiration.placeholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="7d">{t('expiration.options.7d')}</SelectItem>
                      <SelectItem value="30d">{t('expiration.options.30d')}</SelectItem>
                      <SelectItem value="90d">{t('expiration.options.90d')}</SelectItem>
                      <SelectItem value="1y">{t('expiration.options.1y')}</SelectItem>
                      <SelectItem value="never">{t('expiration.options.never')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>{t('expiration.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rateLimitEnabled"
              render={({ field }) => (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('usageLimits.label')}</FormLabel>
                    <p className="text-sm text-muted-foreground">{t('usageLimits.description')}</p>
                  </div>

                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('rateLimit.label')}</FormLabel>
                      <FormDescription>{t('rateLimit.description')}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>

                  {form.watch('rateLimitEnabled') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="rateLimitMax"
                        render={({ field: rateMaxField }) => (
                          <FormItem>
                            <FormLabel>{t('rateLimit.maxRequests')}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="100"
                                {...rateMaxField}
                                onChange={(e) => rateMaxField.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormDescription>{t('rateLimit.maxRequestsDesc')}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rateLimitTimeWindow"
                        render={({ field: rateWindowField }) => (
                          <FormItem>
                            <FormLabel>{t('rateLimit.timeWindow')}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="60000"
                                {...rateWindowField}
                                onChange={(e) => rateWindowField.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormDescription>{t('rateLimit.timeWindowDesc')}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="remaining"
                      render={({ field: remainingField }) => (
                        <FormItem>
                          <FormLabel>{t('usageLimits.remaining')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1000"
                              {...remainingField}
                              onChange={(e) => remainingField.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>{t('usageLimits.remainingDesc')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="refillAmount"
                      render={({ field: refillAmountField }) => (
                        <FormItem>
                          <FormLabel>{t('usageLimits.refillAmount')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="100"
                              {...refillAmountField}
                              onChange={(e) => refillAmountField.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>{t('usageLimits.refillAmountDesc')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="refillInterval"
                      render={({ field: refillIntervalField }) => (
                        <FormItem>
                          <FormLabel>{t('usageLimits.refillInterval')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="3600000"
                              {...refillIntervalField}
                              onChange={(e) => refillIntervalField.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>{t('usageLimits.refillIntervalDesc')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="metadata"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('metadata.label')}</FormLabel>
                  <FormControl>
                    <JsonInput value={field.value ?? {}} onChange={(value) => field.onChange(value)} />
                  </FormControl>
                  <FormDescription>{t('metadata.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? t('creating') : t('createButton')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
