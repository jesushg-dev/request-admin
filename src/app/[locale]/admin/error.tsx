'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { BugIcon, CircleAlertIcon, RefreshCwIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ErrorPageProps {
  error?: Error;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error }) => {
  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-1 flex-col gap-4 overflow-hidden py-4 lg:py-12">
      <Card className="flex w-full flex-1 flex-col items-center justify-center rounded-lg px-8 py-4 shadow-md">
        <CardHeader>
          <CircleAlertIcon className="mx-auto mb-4 h-8 w-8 text-red-500" />
          <h1 className="text-center text-xl font-bold">Oops! Something went wrong.</h1>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <p className="text-center text-muted-foreground">
            {process.env.NODE_ENV === 'development' && error?.message ? `Error message: ${error.message}` : 'We encountered an unexpected error. Please try again later.'}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <Button onClick={handleRefresh} type="button" variant="outline">
              Refresh Page
              <RefreshCwIcon className="ml-2 h-4 w-4" />
            </Button>
            <Button asChild>
              <Link href="/">Go back to home</Link>
            </Button>
            <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
              Report
              <BugIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
