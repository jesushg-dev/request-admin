'use client';

import { useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { authClient } from '@/server/auth-client';
import { LoginSchema } from '@/services/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon, OctagonAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardWrapper } from '@/components/auth/card-wrapper';
import { AlertBanner } from '@/components/custom-ui/alert-banner';
import { PasswordInput } from '@/components/custom-ui/password-input';

const LoginForm = () => {
  const t = useTranslations('auth.loginForm');
  const searchParams = useSearchParams();
  const errorQuery = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl');

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
    startTransition(async () => {
      const toastId = toast('login-toast');

      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
          callbackURL: callbackUrl ?? DEFAULT_LOGIN_REDIRECT,
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
            //alert(ctx.error.message);
          },
        }
      );
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
            </div>
            <Button disabled={isPending} type="submit" className="w-full">
              {t('actions.login')}
              {isPending && <LoaderCircleIcon className="animate-spin" />}
            </Button>
          </form>
        </Form>
      </CardWrapper>
    </div>
  );
};

export default LoginForm;
