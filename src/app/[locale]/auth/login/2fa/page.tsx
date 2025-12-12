'use client';

import { useState, useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { authClient } from '@/server/auth-client';
import { LoaderCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CardWrapper } from '@/components/auth/card-wrapper';

type MfaMethod = 'totp' | 'email';

const LoginForm = () => {
  const router = useRouter();
  const t = useTranslations('auth.twoFactor');
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<MfaMethod>('totp');

  const [isPending, startTransition] = useTransition();

  const onSubmit = () => {
    startTransition(async () => {
      const toastId = toast('login-toast');

      if (selectedMethod === 'email') {
        await authClient.twoFactor.verifyOtp(
          {
            code: verificationCode,
          },
          {
            onRequest: () => {
              toast.loading(t('loading'), { id: toastId });
            },
            onSuccess: () => {
              router.push('/admin');
              toast.success(t('success'), { id: toastId });
            },
            onError: (ctx: { error: Error }) => {
              toast.error(t('error', { error: ctx.error.message }), { id: toastId });
            },
          }
        );
        return;
      }

      await authClient.twoFactor.verifyTotp(
        {
          code: verificationCode,
        },
        {
          onRequest: () => {
            toast.loading(t('loading'), { id: toastId });
          },
          onSuccess: () => {
            router.push('/admin');
            toast.success(t('success'), { id: toastId });
          },
          onError: (ctx: { error: Error }) => {
            toast.error(t('error', { error: ctx.error.message }), { id: toastId });
          },
        }
      );
    });
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <CardWrapper headerTitle={t('headerTitle')} headerLabel={t('headerLabel')} backButtonLabel={t('backupCode')} backButtonHref="/auth/register">
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-4 w-full">
            <Label>{t('selectMethod')}</Label>
            <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as MfaMethod)} className="space-y-3">
              <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent">
                <RadioGroupItem value="authenticator" id="authenticator" />
                <Label htmlFor="authenticator" className="flex-1 cursor-pointer">
                  <div className="font-medium">{t('methods.authenticator.label')}</div>
                  <div className="text-sm text-muted-foreground">{t('methods.authenticator.description')}</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex-1 cursor-pointer">
                  <div className="font-medium">{t('methods.email.label')}</div>
                  <div className="text-sm text-muted-foreground">{t('methods.email.description')}</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <Label>{t('insertCode')}</Label>
            <InputOTP disabled={isPending} maxLength={6} value={verificationCode} onChange={(value) => setVerificationCode(value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {/*selectedMethod !== 'totp' && (
              <Button variant="link" className="h-auto p-0 text-sm" onClick={() => alert(`Code would be resent via ${selectedMethod}`)}>
                Resend code
              </Button>
            )*/}
          </div>

          <Button disabled={isPending} type="button" className="w-full" onClick={onSubmit}>
            {t('actions.login')}
            {isPending && <LoaderCircleIcon className="animate-spin" />}
          </Button>
        </div>
      </CardWrapper>
    </div>
  );
};

export default LoginForm;
