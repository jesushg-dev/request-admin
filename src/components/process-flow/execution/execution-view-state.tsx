import { type FC } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { completedNodeIdsAtom, executionHistoryAtom, totalTimeAtom } from './store/use-execution-store';

interface ExecutionViewErrorProps {
  error: string;
}

export const ExecutionViewError: FC<ExecutionViewErrorProps> = ({ error }) => {
  const t = useTranslations('component.flowExecution.execution.executionViewError');
  return (
    <div className="container py-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{error}</AlertTitle>
        <AlertDescription>
          <div className="mt-4">
            <p>{t('howToCreate')}</p>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li>{t('stepBuilder')}</li>
              <li>{t('stepDesign')}</li>
              <li>{t('stepValidate')}</li>
              <li>{t('stepReturn')}</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

interface ExecutionViewSuccessProps {
  resetExecution: () => void;
}

export const ExecutionViewSuccess: FC<ExecutionViewSuccessProps> = ({ resetExecution }) => {
  const t = useTranslations('component.flowExecution.execution.executionViewSuccess');
  const [completedNodeIds] = useAtom(completedNodeIdsAtom);
  const [executionHistory] = useAtom(executionHistoryAtom);
  const totalTime = useAtomValue(totalTimeAtom);

  const formattedTime =
    [totalTime.hours ? `${totalTime.hours}h` : null, totalTime.minutes ? `${totalTime.minutes}m` : null, totalTime.seconds ? `${totalTime.seconds}s` : null].filter(Boolean).join(' ') || '0s';

  return (
    <div className="bg-green-50 dark:bg-green-900 p-4 rounded-md border border-green-200 dark:border-green-700 mb-4">
      <h3 className="text-lg font-medium text-green-800 dark:text-green-100 mb-2">{t('title')}</h3>
      <p className="text-sm text-green-700 dark:text-green-200 mb-4">{t('description')}</p>
      <div className="space-y-2">
        <p className="text-sm font-medium dark:text-green-100">{t('summary')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li className="text-green-900 dark:text-green-100">{t('completedNodes', { count: completedNodeIds.length })}</li>
          <li className="text-green-900 dark:text-green-100">{t('totalTime', { time: formattedTime })}</li>
          <li className="text-green-900 dark:text-green-100">{t('executedSteps', { count: executionHistory.length })}</li>
        </ul>
      </div>
      <Button onClick={resetExecution} size="sm" className="mt-4" variant="destructive">
        <AlertTriangle className="w-4 h-4 mr-2" /> {t('reset')}
      </Button>
    </div>
  );
};

export const ExecutionViewPlaceholder: React.FC = () => {
  return (
    <div className="container py-6 flex items-center justify-center">
      <div className="w-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="w-48 h-6" /> {/* Title */}
            <Skeleton className="w-64 h-4" /> {/* Subtitle */}
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-20 h-4" />
          </div>
          <Skeleton className="w-full h-2 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          {/* Left: Steps */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-4 p-4 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-700 flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-32 h-5" />
                  </div>
                  <Skeleton className="w-20 h-6 rounded" />
                </div>
                <Skeleton className="w-40 h-4" />
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <Skeleton className="w-24 h-3 mb-1" />
                    <Skeleton className="w-20 h-4" />
                  </div>
                  <div>
                    <Skeleton className="w-24 h-3 mb-1" />
                    <Skeleton className="w-20 h-4" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="w-24 h-8 rounded" />
                  <Skeleton className="w-24 h-8 rounded" />
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <Skeleton className="w-32 h-10 rounded" />
              <Skeleton className="w-24 h-10 rounded" />
            </div>
          </div>

          {/* Right: Current Step & History */}
          <div className="flex flex-col gap-4">
            {/* Current Step Card */}
            <div className="border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-700">
              <div className="h-1 bg-blue-200 dark:bg-blue-900 rounded-t" />
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="w-32 h-5" />
                  <Skeleton className="w-20 h-6 rounded" />
                </div>
                <Skeleton className="w-40 h-4" />
                <div className="grid grid-cols-2 gap-4 mb-3 mt-2">
                  <div>
                    <Skeleton className="w-24 h-3 mb-1" />
                    <Skeleton className="w-20 h-4" />
                  </div>
                  <div>
                    <Skeleton className="w-24 h-3 mb-1" />
                    <Skeleton className="w-20 h-4" />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-700 flex flex-col gap-2">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-full h-8 rounded" />
                  <Skeleton className="w-full h-8 rounded" />
                </div>
              </div>
            </div>
            {/* Execution History Card */}
            <div className="border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-700 p-4 flex flex-col gap-2">
              <Skeleton className="w-32 h-5" />
              <Skeleton className="w-24 h-4" />
              <div className="flex items-center gap-2 mt-2">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-16 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
