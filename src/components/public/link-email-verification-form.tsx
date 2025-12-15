'use client';

import { useState } from 'react';
import { sendEmailVerification } from '@/actions/link-access';
import { Key } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';

interface LinkEmailVerificationFormProps {
  slug: string;
  email: string;
}

export function LinkEmailVerificationForm({ slug, email }: LinkEmailVerificationFormProps) {
  const t = useTranslations('public.link');
  const { watch, setValue } = useFormContext();
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const verificationCode = watch('verificationCode') || '';

  const handleCodeChange = (value: string) => {
    setValue('verificationCode', value);
  };

  const handleResendCode = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    try {
      const result = await sendEmailVerification(slug, email);
      if (result.success) {
        toast.success(t('email.codeSent'));

        // Start 60 second countdown
        setCanResend(false);
        setCountdown(60);

        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setCanResend(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(result.error || t('email.sendError'));
      }
    } catch (error) {
      toast.error(t('email.sendError'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Key className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t('email.verificationTitle')}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{t('email.verificationDescription', { email })}</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t('email.codeLabel')}</Label>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={verificationCode} onChange={handleCodeChange}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <div className="flex justify-center">
          <Button type="button" variant="link" onClick={handleResendCode} disabled={!canResend || isResending} className="text-sm">
            {isResending ? t('email.resending') : countdown > 0 ? t('email.resendIn', { seconds: countdown }) : t('email.resendCode')}
          </Button>
        </div>
      </div>
    </div>
  );
}
