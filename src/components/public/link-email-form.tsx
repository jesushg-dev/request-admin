'use client';

import { useState } from 'react';
import { Mail, Key } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { validateLinkEmail, sendEmailVerification, verifyEmailCode } from '@/actions/link-access';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface LinkEmailFormProps {
  slug: string;
  requiresVerification: boolean;
  onSuccess: (email: string) => void;
}

export function LinkEmailForm({ slug, requiresVerification, onSuccess }: LinkEmailFormProps) {
  const t = useTranslations('public.link');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'email' | 'verification'>('email');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(t('email.required'));
      return;
    }

    setIsLoading(true);
    try {
      const validation = await validateLinkEmail(slug, email);
      if (!validation.success) {
        toast.error(validation.error || t('email.notAllowed'));
        return;
      }

      if (requiresVerification) {
        const sendResult = await sendEmailVerification(slug, email);
        if (sendResult.success) {
          setStep('verification');
          toast.success(t('email.codeSent'));
        } else {
          toast.error(sendResult.error || t('email.sendError'));
        }
      } else {
        onSuccess(email);
      }
    } catch (error) {
      toast.error(t('email.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error(t('email.codeInvalid'));
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyEmailCode(slug, email, verificationCode);
      if (result.success) {
        onSuccess(email);
      } else {
        toast.error(result.error || t('email.codeInvalid'));
      }
    } catch (error) {
      toast.error(t('email.verifyError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'verification') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>{t('email.verificationTitle')}</CardTitle>
          </div>
          <CardDescription>{t('email.verificationDescription', { email })}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('email.codeLabel')}</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode} disabled={isLoading}>
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
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('email')} disabled={isLoading}>
                {t('email.back')}
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading || verificationCode.length !== 6}>
                {isLoading ? t('email.verifying') : t('email.verify')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle>{t('email.title')}</CardTitle>
        </div>
        <CardDescription>{t('email.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email.label')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('email.placeholder')}
              disabled={isLoading}
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('email.submitting') : t('email.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

