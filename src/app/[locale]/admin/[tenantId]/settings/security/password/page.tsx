'use client';

import { useTransition } from 'react';
import { authClient } from '@/server/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const passwordDefaultValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  revokeOtherSessions: false,
};

export default function SecurityForm() {
  const t = useTranslations('admin.setting.password');
  const [isPending, startTransition] = useTransition();

  const passwordFormSchema = z
    .object({
      currentPassword: z.string().min(8, {
        message: t('errors.minLength'),
      }),
      newPassword: z.string().min(8, {
        message: t('errors.minLength'),
      }),
      confirmPassword: z.string().min(8, {
        message: t('errors.minLength'),
      }),
      revokeOtherSessions: z.boolean().default(false),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('errors.passwordMismatch'),
      path: ['confirmPassword'],
    });

  type PasswordFormValues = z.infer<typeof passwordFormSchema>;

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: passwordDefaultValues,
    mode: 'onChange',
  });

  function onPasswordSubmit({ newPassword, currentPassword, revokeOtherSessions }: PasswordFormValues) {
    startTransition(async () => {
      const toastId = toast.loading(t('updating'));
      await authClient.changePassword(
        { newPassword, currentPassword, revokeOtherSessions },
        {
          onSuccess: () => {
            passwordForm.reset(passwordDefaultValues);
            toast.success(t('success'), { id: toastId });
          },
          onError(context) {
            toast.error(t('error', { error: context.error.message }), { id: toastId });
          },
          onRequest() {
            toast.loading(t('updating'), { id: toastId });
          },
        }
      );
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.currentPassword.label')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.newPassword.label')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.confirmPassword.label')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="revokeOtherSessions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('fields.revokeOtherSessions.label')}</FormLabel>
                      <FormDescription>{t('fields.revokeOtherSessions.description')}</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? t('buttons.updating') : t('buttons.update')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
