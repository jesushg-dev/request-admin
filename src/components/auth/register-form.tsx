'use client';

import { useState, useTransition } from 'react';
import { register } from '@/actions/register';
import { RegisterSchema } from '@/services/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardWrapper } from '@/components/auth/card-wrapper';
import { FormError } from '@/components/prullenbak/form-error';
import { FormSuccess } from '@/components/prullenbak/form-success';

export const RegisterForm = () => {
  const t = useTranslations('auth.registerForm');
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError('');
    setSuccess('');

    startTransition(() => {
      register(values).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <CardWrapper headerLabel={t('header')} backButtonLabel={t('alreadyHaveAccount')} backButtonHref="/auth/login" showSocial>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.username')}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder={t('placeholders.username')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    <Input {...field} disabled={isPending} placeholder={t('placeholders.password')} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type="submit" className="w-full">
            {t('actions.createAccount')}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
