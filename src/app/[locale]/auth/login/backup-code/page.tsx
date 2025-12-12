'use client';

import { useState, useTransition } from 'react';
import { authClient } from '@/server/auth-client';
import { LoaderCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { CardWrapper } from '@/components/auth/card-wrapper';

const LoginForm = () => {
  const t = useTranslations('auth.twoFactor');
  const [verificationCode, setVerificationCode] = useState('');

  const [isPending, startTransition] = useTransition();

  const onSubmit = () => {
    startTransition(async () => {
      const toastId = toast('login-toast');

      await authClient.twoFactor.verifyBackupCode(
        {
          code: verificationCode,
        },
        {
          onRequest: () => {
            toast.loading(t('loading'), { id: toastId });
          },
          onSuccess: () => {
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
      <CardWrapper headerTitle={t('headerBackupTitle')} headerLabel={t('headerLabel')} backButtonLabel={t('login')} backButtonHref="/auth/login">
        <div className="w-full flex flex-col justify-center items-center gap-4">
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
