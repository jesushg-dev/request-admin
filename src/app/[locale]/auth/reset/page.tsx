'use client';

import { useTransition } from 'react';
import { authClient } from '@/server/auth-client';
import { ResetSchema } from '@/services/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardWrapper } from '@/components/auth/card-wrapper';

const ResetForm = () => {
  const t = useTranslations('auth.resetForm'); // Namespace for translations
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
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
    <CardWrapper headerLabel={t('header')} backButtonLabel={t('backToLogin')} backButtonHref="/auth/login">
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
