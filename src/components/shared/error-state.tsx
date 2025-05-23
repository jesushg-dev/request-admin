import React, { useEffect } from 'react';
import Link from 'next/link';
import { BugIcon, CircleAlertIcon, RefreshCwIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ErrorStateProps {
  error?: Error;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  const t = useTranslations('component.errorState');

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex-1 flex p-4">
      <Card className="flex w-full flex-1 flex-col items-center justify-center rounded-lg px-8 py-4 shadow-md">
        <CardHeader>
          <CircleAlertIcon className="mx-auto mb-4 h-8 w-8 text-red-500" />
          <h1 className="text-center text-xl font-bold">{t('title')}</h1>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground text-center">{process.env.NODE_ENV === 'development' && error?.message ? t('errorMessage', { message: error.message }) : t('description')}</p>
          <div className="mt-4 flex items-center gap-4">
            <Button onClick={handleRefresh} type="button" variant="outline">
              {t('refresh')}
              <RefreshCwIcon className="ml-2 h-4 w-4" />
            </Button>
            <Button asChild>
              <Link href="/">{t('home')}</Link>
            </Button>
            <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
              {t('report')}
              <BugIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorState;
