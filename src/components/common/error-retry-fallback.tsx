import React from 'react';
import { QueryError } from '@zenstackhq/tanstack-query/runtime-v5';
import { CircleAlertIcon, RotateCcwIcon } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';

interface ErrorRetryFallbackProps {
  error?: QueryError;
  onRetry: () => void;
}

const ErrorRetryFallback: React.FC<ErrorRetryFallbackProps> = ({ error, onRetry }) => {
  return (
    <Card className="flex w-full flex-col items-center justify-center rounded-lg px-8 py-4 shadow-md">
      <CardHeader>
        <CircleAlertIcon className="mx-auto mb-4 h-8 w-8 text-red-500" />
        <h1 className="text-center text-xl font-bold">Oops! Something went wrong.</h1>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">We encountered an unexpected error. Please try again.</p>
        {error?.message && <span className="text-center text-muted-foreground">{error?.message}</span>}
        <div className="mt-4 flex justify-center">
          <Button type="button" variant="destructive" onClick={onRetry}>
            Retry
            <RotateCcwIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorRetryFallback;
