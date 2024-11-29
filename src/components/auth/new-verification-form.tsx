'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { newVerification } from '@/actions/new-verification';
import { useTranslations } from 'next-intl';
import { BeatLoader } from 'react-spinners';

import { CardWrapper } from '@/components/auth/card-wrapper';
import { FormError } from '@/components/prullenbak/form-error';
import { FormSuccess } from '@/components/prullenbak/form-success';

export const NewVerificationForm = () => {
  const t = useTranslations('auth.newVerificationForm'); // Namespace for translations
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError(t('errors.missingToken'));
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError(t('errors.generic'));
      });
  }, [token, success, error, t]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper headerLabel={t('header')} backButtonLabel={t('backToLogin')} backButtonHref="/auth/login">
      <div className="flex w-full items-center justify-center">
        {!success && !error && <BeatLoader />}
        <FormSuccess message={success} />
        {!success && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
};
