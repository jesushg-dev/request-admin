'use client';

import { useEffect, useState, useTransition } from 'react';
import { authClient, useSession } from '@/server/auth-client';
import { useProfileSchema, type TProfileSchema } from '@/services/schemas/settings.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import useMessage from '@/lib/message';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { PhoneInput } from '@/components/custom-ui/phone-input';

type ProfileFormValues = TProfileSchema;

// Default values for the form
const defaultValues: ProfileFormValues = {
  name: '',
  email: '',
  username: '',
  displayUsername: '',
  phoneNumber: '',
  image: '',
};

export default function UserProfileForm() {
  const t = useTranslations('admin.setting.account');

  const message = useMessage();
  const { data } = useSession();
  const [isPending, startTransition] = useTransition();
  const [isVerifyingEmail, startVerifyingEmail] = useTransition();
  const [isVerifyingPhone, startVerifyingPhone] = useTransition();
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const profileSchema = useProfileSchema();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: 'onChange',
  });

  const onSubmit = (newData: ProfileFormValues) => {
    if (String(data?.user.phoneNumber || '') !== String(newData.phoneNumber || '') && !phoneVerified) {
      toast.error(t('errors.verifyPhoneBeforeSave'));
      return;
    }

    startTransition(async () => {
      const toastId = toast.loading(t('toast.savingChanges'));
      await authClient.updateUser(
        {
          name: newData.name,
          image: newData.image,
          username: newData.username !== data?.user.username ? newData.username : undefined,
          displayUsername: newData.displayUsername !== data?.user.displayUsername ? newData.displayUsername : undefined,
        },
        {
          onSuccess: () => {
            toast.success(t('toast.profileUpdated'), { id: toastId });
          },
          onError(context) {
            toast.error(t('errors.updateProfile', { message: context.error.message }), { id: toastId });
          },
          onRequest() {
            toast.loading(t('toast.savingChanges'), { id: toastId });
          },
        }
      );
    });
  };

  const handleVerifyEmail = async () => {
    const email = form.getValues('email');
    if (!email) return;

    startVerifyingEmail(async () => {
      const toastId = toast.loading(t('toast.sendingEmailVerification'));

      const result = await authClient.emailOtp.sendVerificationOtp(
        { email, type: 'email-verification' },
        {
          onSuccess: () => {
            toast.success(t('toast.emailCodeSent'), { id: toastId });
          },
          onError: (context) => {
            toast.error(t('errors.sendEmailCode', { message: context.error.message }), { id: toastId });
          },
        }
      );

      if ('error' in result) return;

      const { confirmed, code } = await message.verificationCode(t('dialogs.emailVerification.message'), {
        title: t('dialogs.emailVerification.title'),
        confirmText: t('dialogs.emailVerification.confirm'),
        cancelText: t('dialogs.emailVerification.cancel'),
      });

      if (!confirmed) return;

      await authClient.emailOtp.verifyEmail(
        { email, otp: code },
        {
          onSuccess: () => {
            setEmailVerified(true);
            toast.success(t('toast.emailVerified'), { id: toastId });
          },
          onError: (context) => {
            toast.error(t('errors.verifyEmail', { message: context.error.message }), { id: toastId });
          },
        }
      );
    });
  };

  const handleVerifyPhone = async () => {
    const phoneNumber = form.getValues('phoneNumber');
    if (!phoneNumber) return;

    startVerifyingPhone(async () => {
      const toastId = toast.loading(t('toast.sendingSmsVerification'));

      const result = await authClient.phoneNumber.sendOtp(
        { phoneNumber },
        {
          onSuccess: () => {
            toast.success(t('toast.smsCodeSent'), { id: toastId });
          },
          onError: (context) => {
            toast.error(t('errors.sendSmsCode', { message: context.error.message }), { id: toastId });
          },
        }
      );

      if ('error' in result) return;

      const { confirmed, code } = await message.verificationCode(t('dialogs.phoneVerification.message'), {
        title: t('dialogs.phoneVerification.title'),
        confirmText: t('dialogs.phoneVerification.confirm'),
        cancelText: t('dialogs.phoneVerification.cancel'),
      });

      if (!confirmed) return;

      await authClient.phoneNumber.verify(
        { phoneNumber, code, updatePhoneNumber: true },
        {
          onSuccess: () => {
            setPhoneVerified(true);
            toast.success(t('toast.phoneVerified'), { id: toastId });
          },
          onError: (context) => {
            toast.error(t('errors.verifyPhone', { message: context.error.message }), { id: toastId });
          },
        }
      );
    });
  };

  useEffect(() => {
    if (data?.user) {
      form.reset({
        name: data.user.name,
        email: data.user.email,
        username: data.user.username ?? '',
        displayUsername: data.user.displayUsername ?? '',
        phoneNumber: data.user.phoneNumber ?? '',
        image: data.user.image ?? '',
      });

      setEmailVerified(data.user.emailVerified);
      setPhoneVerified(data.user.phoneNumberVerified ?? false);
    }
  }, [data, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/placeholder.svg?height=80&width=80" alt={t('avatarAlt')} />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm">
              {t('buttons.changeAvatar')}
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.name.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.name.placeholder')} {...field} />
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
                    <FormLabel>{t('form.email.label')}</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <div className="relative w-full">
                          <Input disabled placeholder={t('form.email.placeholder')} {...field} />
                          {emailVerified && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      {!emailVerified && (
                        <Button type="button" variant="outline" size="sm" onClick={handleVerifyEmail} disabled={isVerifyingEmail} className="whitespace-nowrap">
                          {isVerifyingEmail ? t('buttons.sending') : t('buttons.verify')}
                        </Button>
                      )}
                      {emailVerified && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {t('badges.verified')}
                        </Badge>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campos restantes con el mismo patrón */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.username.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.username.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('form.username.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.displayUsername.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.displayUsername.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('form.displayUsername.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.phoneNumber.label')}</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <div className="relative w-full">
                          <PhoneInput
                            placeholder={t('form.phoneNumber.placeholder')}
                            {...field}
                            onChange={(val) => {
                              field.onChange(val);
                              setPhoneVerified(false);
                            }}
                          />
                          {phoneVerified && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      {!phoneVerified && (
                        <Button type="button" variant="outline" size="sm" onClick={handleVerifyPhone} disabled={isVerifyingPhone} className="whitespace-nowrap">
                          {isVerifyingPhone ? t('buttons.sending') : t('buttons.verify')}
                        </Button>
                      )}
                      {phoneVerified && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {t('badges.verified')}
                        </Badge>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? t('buttons.saving') : t('buttons.saveChanges')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
