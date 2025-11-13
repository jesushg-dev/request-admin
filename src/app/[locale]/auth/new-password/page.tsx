'use client';

import { useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/server/auth-client';
import { useNewPasswordSchema, type TNewPasswordSchema } from '@/services/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardWrapper } from '@/components/auth/card-wrapper';

const NewPasswordForm = () => {
  const t = useTranslations('auth.newPasswordForm');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isPending, startTransition] = useTransition();

  const newPasswordSchema = useNewPasswordSchema();

  const form = useForm<TNewPasswordSchema>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = (values: TNewPasswordSchema) => {
    if (!token) {
      toast.error(t('tokenNoFound'), { id: 'new-password-toast' });
      return;
    }

    startTransition(async () => {
      const toastId = toast('new-password-toast');

      await authClient.resetPassword(
        {
          token,
          newPassword: values.password,
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
    <CardWrapper headerTitle={t('headerTitle')} headerLabel={t('headerLabel')} backButtonLabel={t('rememberPassword')} backButtonHref="/auth/login">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.password')}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder={t('placeholders.password')} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isPending} type="submit" className="w-full">
            {t('actions.resetPassword')}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default NewPasswordForm;
