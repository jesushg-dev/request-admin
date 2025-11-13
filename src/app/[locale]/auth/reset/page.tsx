'use client';

import { useTransition } from 'react';
import { authClient } from '@/server/auth-client';
import { useResetSchema, type TResetSchema } from '@/services/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardWrapper } from '@/components/auth/card-wrapper';

const ResetForm = () => {
  const t = useTranslations('auth.resetForm');
  const [isPending, startTransition] = useTransition();

  const resetSchema = useResetSchema();

  const form = useForm<TResetSchema>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (values: TResetSchema) => {
    startTransition(async () => {
      const toastId = toast('register-toast');

      await authClient.forgetPassword(
        {
          email: values.email,
          redirectTo: '/auth/new-password',
        },
        {
          onRequest: () => {
            toast.loading(t('loading'), { id: toastId });
          },
          onSuccess: () => {
            toast.success(t('success'), { id: toastId });
          },
          onError: (ctx) => {
            toast.error(`${t('error')}: ${ctx.error.message}`, { id: toastId });
          },
        }
      );
    });
  };

  return (
    <CardWrapper headerTitle={t('headerTitle')} headerLabel={t('headerLabel')} backButtonLabel={t('noAccount')} backButtonHref="/auth/register">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.email')}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder={t('placeholders.email')} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isPending} type="submit" className="w-full">
            {t('actions.sendResetEmail')}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default ResetForm;
