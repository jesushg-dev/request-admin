'use client';

import { useTransition } from 'react';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { authClient } from '@/server/auth-client';
import { useEmailChangeSchema, type TEmailChangeSchema } from '@/services/schemas/settings.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function SecurityForm() {
  const t = useTranslations('admin.setting.email');
  const [isPending, startTransition] = useTransition();

  const emailSchema = useEmailChangeSchema();

  const emailForm = useForm<TEmailChangeSchema>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      newEmail: '',
      callbackURL: DEFAULT_LOGIN_REDIRECT,
    },
    mode: 'onChange',
  });

  function onEmailSubmit({ newEmail, callbackURL }: TEmailChangeSchema) {
    startTransition(async () => {
      const toastId = toast.loading(t('updating'));
      await authClient.changeEmail(
        { newEmail, callbackURL },
        {
          onSuccess: () => {
            emailForm.reset({ newEmail: '' });
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
        <Alert className="mb-4">
          <Mail className="h-4 w-4" />
          <AlertTitle>{t('verificationRequired')}</AlertTitle>
          <AlertDescription>{t('verificationDescription')}</AlertDescription>
        </Alert>

        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="newEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.newEmail.label')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your.new.email@example.com" {...field} />
                  </FormControl>
                  <FormDescription>{t('fields.newEmail.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? t('buttons.sending') : t('buttons.send')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
