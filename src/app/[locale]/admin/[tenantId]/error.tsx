'use client';

import { FC } from 'react';

import ErrorState from '@/components/shared/error-state';

interface ErrorPageProps {
  error?: Error;
}

const ErrorPage: FC<ErrorPageProps> = ({ error }) => {
  return <ErrorState error={error} />;
};

export default ErrorPage;
