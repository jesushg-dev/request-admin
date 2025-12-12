'use client';

import { useTransition } from 'react';
import { authClient } from '@/server/auth-client';
import { usePasswordChangeSchema, type TPasswordChangeSchema } from '@/services/schemas/settings.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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

  const passwordSchema = usePasswordChangeSchema();

  const passwordForm = useForm<TPasswordChangeSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: passwordDefaultValues,
    mode: 'onChange',
  });

  function onPasswordSubmit({ newPassword, currentPassword, revokeOtherSessions }: TPasswordChangeSchema) {
    startTransition(async () => {
      const toastId = toast.loading(t('updating'));
      await authClient.changePassword(
        { newPassword, currentPassword, revokeOtherSessions },
        {
          onSuccess: () => {
            passwordForm.reset(passwordDefaultValues);
            toast.success(t('success'), { id: toastId });
          },
          onError(context: { error: Error }) {
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
