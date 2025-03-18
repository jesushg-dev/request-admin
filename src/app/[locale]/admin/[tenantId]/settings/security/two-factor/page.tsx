'use client';

import { useState, useTransition } from 'react';
import { authClient, useSession } from '@/server/auth-client';
import { ArrowRight, Copy, Key, QrCodeIcon, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

import useMessage from '@/lib/message';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { AlertBanner } from '@/components/custom-ui/alert-banner';

export default function TwoFactorAuthPage() {
  const message = useMessage();
  const { data } = useSession();
  const t = useTranslations('admin.setting.twoFactor');

  const [copied, setCopied] = useState(false);
  const [qrcode, setQrcode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isActiving, setIsActivating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCopy = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleTwoFactor = async (checked: boolean) => {
    if (checked) {
      handleTwoFactorEnable();
    } else {
      handleTwoFactorDisable();
    }
  };

  const handleTwoFactorEnable = async () => {
    const { confirmed, password } = await message.password(t('dialogs.enable.message'), {
      title: t('dialogs.enable.title'),
      confirmText: t('dialogs.enable.confirm'),
      cancelText: t('dialogs.enable.cancel'),
    });

    if (!confirmed || password.length <= 0) return;

    startTransition(async () => {
      const toastId = toast.loading(t('toast.enabling'));
      const { data } = await authClient.twoFactor.enable(
        { password },
        {
          onSuccess: () => {
            setIsActivating(true);
            toast.success(t('toast.enabled'), { id: toastId });
          },
          onError(context) {
            toast.error(t('toast.error', { message: context.error.message }), { id: toastId });
          },
        }
      );

      if (data && 'totpURI' in data) {
        setQrcode(data.totpURI);
      }

      if (data && 'backupCodes' in data) {
        setBackupCodes(data.backupCodes);
      }
    });
  };

  const handleTwoFactorDisable = async () => {
    const { confirmed, password } = await message.password(t('dialogs.disable.message'), {
      title: t('dialogs.disable.title'),
      confirmText: t('dialogs.disable.confirm'),
      cancelText: t('dialogs.disable.cancel'),
    });

    if (!confirmed || password.length <= 0) return;

    startTransition(async () => {
      const toastId = toast.loading(t('toast.disabling'));
      await authClient.twoFactor.disable(
        { password },
        {
          onSuccess: () => {
            toast.success(t('toast.disabled'), { id: toastId });
            setQrcode('');
            setBackupCodes([]);
            setIsActivating(false);
          },
          onError(context) {
            toast.error(t('toast.error', { message: context.error.message }), { id: toastId });
          },
        }
      );
    });
  };

  const sendOtpCode = async () => {
    const toastId = toast.loading(t('toast.sendingCode'));
    await authClient.twoFactor.sendOtp(
      {},
      {
        onSuccess: () => {
          setQrcode('');
          toast.success(t('toast.codeSent'), { id: toastId });
        },
        onError(context) {
          toast.error(t('toast.error', { message: context.error.message }), { id: toastId });
        },
      }
    );
  };

  const handleVerify = async () => {
    const trustDevice = await message.confirm(t('dialogs.trustDevice.message'), {
      title: t('dialogs.trustDevice.title'),
      confirmText: t('dialogs.trustDevice.confirm'),
      cancelText: t('dialogs.trustDevice.cancel'),
    });

    if (!verificationCode || verificationCode.length !== 6) {
      toast.error(t('errors.invalidCode'));
      return;
    }

    if (qrcode) {
      handleVerifyTotp(trustDevice);
    } else {
      handleVerifyOtp(trustDevice);
    }
  };

  const handleVerifyOtp = async (trustDevice: boolean) => {
    startTransition(async () => {
      const toastId = toast.loading(t('toast.verifying'));
      await authClient.twoFactor.verifyOtp(
        {
          code: verificationCode,
          trustDevice,
        },
        {
          onSuccess: () => {
            toast.success(t('toast.verified'), { id: toastId });
            setQrcode('');
            setVerificationCode('');
            setIsActivating(false);
          },
          onRequest: () => {
            toast.loading(t('toast.verifying'), { id: toastId });
          },
          onError(context) {
            toast.error(t('toast.error', { message: context.error.message }), { id: toastId });
          },
        }
      );
    });
  };

  const handleVerifyTotp = async (trustDevice: boolean) => {
    startTransition(async () => {
      const toastId = toast.loading(t('toast.verifying'));
      await authClient.twoFactor.verifyTotp(
        {
          code: verificationCode,
          trustDevice,
        },
        {
          onSuccess: () => {
            toast.success(t('toast.verified'), { id: toastId });
            setQrcode('');
            setVerificationCode('');
            setIsActivating(false);
          },
          onRequest: () => {
            toast.loading(t('toast.verifying'), { id: toastId });
          },
          onError: (context) => {
            toast.error(t('toast.error', { message: context.error.message }), { id: toastId });
          },
        }
      );
    });
  };

  const handleGetTotpUri = async () => {
    const { confirmed, password } = await message.password(t('dialogs.getTotp.message'), {
      title: t('dialogs.getTotp.title'),
      confirmText: t('dialogs.getTotp.confirm'),
      cancelText: t('dialogs.getTotp.cancel'),
    });

    if (!confirmed || password.length <= 0) return;

    startTransition(async () => {
      const toastId = toast.loading(t('toast.generatingQr'));
      const { data } = await authClient.twoFactor.getTotpUri(
        { password },
        {
          onSuccess: () => {
            toast.success(t('toast.qrGenerated'), { id: toastId });
          },
          onError(context) {
            toast.error(t('toast.error', { message: context.error.message }), { id: toastId });
          },
        }
      );

      if (data?.totpURI) {
        setQrcode(data.totpURI);
      }
    });
  };

  const handleGenerateBackupCodes = async () => {
    const { confirmed, password } = await message.password(t('dialogs.generateBackup.message'), {
      title: t('dialogs.generateBackup.title'),
      confirmText: t('dialogs.generateBackup.confirm'),
      cancelText: t('dialogs.generateBackup.cancel'),
    });

    if (!confirmed || password.length <= 0) return;

    startTransition(async () => {
      const toastId = toast.loading(t('toast.generatingBackup'));
      const { data } = await authClient.twoFactor.generateBackupCodes(
        { password },
        {
          onSuccess: () => {
            toast.success(t('toast.backupGenerated'), { id: toastId });
          },
          onError(context) {
            toast.error(t('toast.error', { message: context.error.message }), { id: toastId });
          },
        }
      );

      if (data?.backupCodes) {
        setBackupCodes(data.backupCodes);
      } else {
        toast.error(t('toast.error', { message: 'Failed to generate backup codes' }), { id: toastId });
        setBackupCodes([]);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full flex flex-col gap-4">
          <Alert variant="default" className="border-primary/20 bg-primary/5">
            <Shield className="h-5 w-5 text-primary" />
            <AlertTitle className="text-primary font-medium">{t('recommendedTitle')}</AlertTitle>
            <AlertDescription className="text-foreground">{t('recommendedDescription')}</AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 text-primary mr-1" />
                  {t('title')}
                </CardTitle>
                <CardDescription>{isActiving ? t('activationStatus.activating') : t('activationStatus.inactive')}</CardDescription>
              </div>
              <Switch checked={data?.user.twoFactorEnabled ?? false} onCheckedChange={handleToggleTwoFactor} disabled={isPending} />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {isActiving && (
                <>
                  <Separator className="my-4" />
                  <div className="grid md:grid-cols-2 gap-4">
                    {qrcode ? (
                      <ol className="flex flex-col gap-4 w-full text-muted-foreground">
                        {([1, 2, 3] as const).map((step) => (
                          <li key={step} className="flex items-start gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-medium flex-shrink-0">{step}</span>
                            <div className="space-y-1">
                              <p className="text-foreground">{t(`steps.qr.${step}.title` as const)}</p>
                              <p className="text-sm">{t(`steps.qr.${step}.description` as const)}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <ol className="flex flex-col gap-4 w-full text-muted-foreground">
                        {([1, 2] as const).map((step) => (
                          <li key={step} className="flex items-start gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-medium flex-shrink-0">{step}</span>
                            <div className="space-y-1">
                              <p className="text-foreground">{t(`steps.email.${step}.title` as const)}</p>
                              <p className="text-sm">{t(`steps.email.${step}.description` as const)}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                    <div className="flex-1 flex flex-col items-center gap-4">
                      {qrcode && (
                        <div className="flex justify-center py-4">
                          <QRCodeSVG value={qrcode} size={200} />
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="verification-code">{t('verification.label')}</Label>
                          <div className="flex gap-2">
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

                            <Button onClick={handleVerify} disabled={isPending || verificationCode.length !== 6}>
                              {t('verification.verifyButton')}
                            </Button>
                          </div>
                        </div>

                        <div className="w-full flex gap-4">
                          <Button size="sm" variant="link" className="p-0 cursor-pointer hover:text-red-500" onClick={sendOtpCode}>
                            {qrcode ? t('verification.emailOption') : t('verification.resendCode')}
                          </Button>
                          {!qrcode && (
                            <Button size="sm" variant="link" className="p-0 cursor-pointer hover:text-blue-500" onClick={handleGetTotpUri}>
                              {t('verification.qrOption')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {backupCodes.length > 0 && !isActiving && (
                <>
                  <Separator className="my-4" />

                  <div className="w-full flex justify-between">
                    <h3 className="text-lg font-medium">{t('backupCodes.title')}</h3>
                    <div className="flex gap-2">
                      <Button disabled={isPending} variant="outline" className="flex-1" onClick={handleCopy}>
                        <Copy className="h-4 w-4 mr-2" />
                        {copied ? t('backupCodes.copiedButton') : t('backupCodes.copyButton')}
                      </Button>
                    </div>
                  </div>

                  <p className="text-muted-foreground">{t('backupCodes.description')}</p>

                  <AlertBanner
                    variant="info"
                    title={t('backupCodes.alert.title')}
                    description={
                      <ul className="list-disc list-inside text-sm">
                        {(t.raw('backupCodes.alert.items') as string[]).map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    }
                  />
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="p-2 bg-muted rounded border border-border font-mono text-sm">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {!qrcode && !backupCodes.length && !isActiving && data?.user.twoFactorEnabled && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-lg font-medium">{t('recovery.title')}</h3>
                    <p className="text-muted-foreground">{t('recovery.description')}</p>
                  </div>
                  <div className="flex flex-col gap-4 w-full">
                    <button type="button" onClick={handleGenerateBackupCodes} className="flex items-center cursor-pointer justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3 justify-start">
                        <Key className="h-5 w-5 text-muted-foreground" />
                        <div className="flex flex-col gap-2 items-start">
                          <p className="font-medium">{t('recovery.backupCodes.title')}</p>
                          <p className="text-sm text-muted-foreground">{t('recovery.backupCodes.description')}</p>
                        </div>
                      </div>
                      <div>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </button>

                    <button type="button" onClick={handleGetTotpUri} className="flex cursor-pointer items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <QrCodeIcon className="h-5 w-5 text-muted-foreground" />
                        <div className="flex flex-col gap-2 items-start">
                          <p className="font-medium">{t('recovery.qr.title')}</p>
                          <p className="text-sm text-muted-foreground">{t('recovery.qr.description')}</p>
                        </div>
                      </div>
                      <div>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
