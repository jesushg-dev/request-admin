'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { login } from '@/actions/login';
import { LoginSchema } from '@/services/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon, OctagonAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardWrapper } from '@/components/auth/card-wrapper';
import { PasswordInput } from '@/components/custom-ui/password-input';
import { FormError } from '@/components/prullenbak/form-error';
import { FormSuccess } from '@/components/prullenbak/form-success';

import { AlertBanner } from '../custom-ui/alert-banner';

export const LoginForm = () => {
  const t = useTranslations('auth.loginForm');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const errorQuery = searchParams.get('error');
  const urlError = searchParams.get('error') === 'OAuthAccountNotLinked' ? t('errors.emailInUse') : '';

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      code: '',
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError('');
    setSuccess('');

    startTransition(() => {
      login(values, callbackUrl)
        .then((data) => {
          if (data?.error) {
            form.reset();
            setError(data.error);
          }

          if (data?.success) {
            form.reset();
            setSuccess(data.success);
          }

          if (data?.twoFactor) {
            setShowTwoFactor(true);
          }
        })
        .catch(() => setError(t('errors.generic')));
    });
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      {errorQuery === 'unauthenticated' && (
        <AlertBanner title={t('errors.unauthenticated')} description={t('errors.unauthenticatedDescription')} variant="error" icon={<OctagonAlert className="h-6 w-6 text-red-500" />} />
      )}
      {errorQuery === 'tenant' && <AlertBanner title={t('errors.tenant')} description={t('errors.tenantDescription')} variant="error" icon={<OctagonAlert className="h-6 w-6 text-red-500" />} />}

      <CardWrapper headerLabel={t('welcome')} backButtonLabel={t('noAccount')} backButtonHref="/auth/register">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {showTwoFactor && (
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.twoFactor')}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isPending} placeholder={t('placeholders.code')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {!showTwoFactor && (
                <>
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
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fields.password')}</FormLabel>
                        <FormControl>
                          <PasswordInput {...field} disabled={isPending} placeholder={t('placeholders.password')} type="password" />
                        </FormControl>
                        <Button size="sm" variant="link" asChild className="px-0 font-normal">
                          <Link href="/auth/reset">{t('forgotPassword')}</Link>
                        </Button>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
            <FormError message={error ?? urlError} />
            <FormSuccess message={success} />
            <Button disabled={isPending} type="submit" className="w-full">
              {showTwoFactor ? t('actions.confirm') : t('actions.login')} {isPending && <LoaderCircleIcon className="animate-spin" />}
            </Button>
          </form>
        </Form>
      </CardWrapper>
    </div>
  );
};
