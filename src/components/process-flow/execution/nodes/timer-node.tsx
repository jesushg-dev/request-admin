import { useState, useTransition } from 'react';
import { createExecutionLog } from '@/actions/execution-flow';
import { useAtom } from 'jotai';
import { Loader2, Timer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTimer } from 'react-timer-hook';
import { toast } from 'sonner';

import type { TimerNodeData } from '@/types/execution-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { completeSimpleNodeAtom } from '../store/use-execution-store';

interface TimerNodeProps extends TimerNodeData {
  nodeId: string;
  tenantId: string;
  executionId: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isBlocked?: boolean;
  index?: number;
}

export function TimerNode({ nodeId, tenantId, executionId, isActive, isCompleted, isBlocked, index, label, duration, timeUnit }: TimerNodeProps) {
  const t = useTranslations('component.flowExecution.execution');
  const [isPending, startTransition] = useTransition();
  const [, handleContinue] = useAtom(completeSimpleNodeAtom);
  const [timerStarted, setTimerStarted] = useState(false);
  const expiryTimestamp = getExpiry(Number(duration), timeUnit);

  const { seconds, minutes, hours, isRunning, pause, resume, restart } = useTimer({
    expiryTimestamp,
    autoStart: false,
    onExpire: () => {
      handleContinue(nodeId);
      toast.success(t('timerNode.toast.success'));
    },
  });

  const handleStartTimer = () => {
    startTransition(async () => {
      const toastId = toast.loading(t('timerNode.toast.starting'));
      try {
        await createExecutionLog(tenantId, executionId, nodeId, 'timer', { duration, timeUnit }, 'success');
        restart(getExpiry(Number(duration), timeUnit), true);
        setTimerStarted(true);
        toast.success(t('timerNode.toast.success'), { id: toastId });
      } catch (error) {
        console.error(t('timerNode.toast.error'), error);
        toast.error(t('timerNode.toast.error'), { id: toastId });
      }
    });
  };

  return (
    <Card
      className={`flex-1 mb-4 border-t-4 ${
        isActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 dark:border-blue-400'
          : isBlocked
            ? 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 opacity-70'
            : isCompleted
              ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/50 dark:border-blue-400'
              : 'border-gray-200 dark:border-gray-700'
      }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span className="dark:text-blue-100">
              {t('timerNode.title')} {index !== undefined ? index + 1 : ''}
            </span>
          </CardTitle>
          <Badge
            variant={isActive ? 'default' : isCompleted ? 'success' : isBlocked ? 'secondary' : 'outline'}
            className={isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : ''}>
            {isActive ? t('status.inProgress') : isCompleted ? t('status.completed') : isBlocked ? t('status.blocked') : t('status.pending')}
          </Badge>
        </div>
        <CardDescription className="dark:text-blue-200">{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('timerNode.estimatedTime')}</p>
            <p className="text-sm dark:text-gray-200">
              {duration} {timeUnit}
            </p>
          </div>
          {isActive && !isCompleted && !isBlocked && (
            <div className="flex flex-col gap-2">
              {timerStarted && (
                <div className="flex items-center gap-2 text-2xl font-mono">
                  <span>{String(hours).padStart(2, '0')}</span>:<span>{String(minutes).padStart(2, '0')}</span>:<span>{String(seconds).padStart(2, '0')}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {!timerStarted && (
                  <Button onClick={handleStartTimer} disabled={isPending} size="sm" className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('timerNode.button')}
                  </Button>
                )}
                {timerStarted && (
                  <>
                    <Button onClick={pause} size="sm" className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700" disabled={!isRunning}>
                      {t('timerNode.pause')}
                    </Button>
                    <Button onClick={resume} size="sm" className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700" disabled={isRunning}>
                      {t('timerNode.resume')}
                    </Button>
                    <Button onClick={() => restart(expiryTimestamp, true)} size="sm" className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700">
                      {t('timerNode.restart')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function getExpiry(duration: number, timeUnit: 'seconds' | 'minutes' | 'hours' | 'days' = 'seconds'): Date {
  const time = new Date();
  switch (timeUnit) {
    case 'minutes':
      time.setMinutes(time.getMinutes() + duration);
      break;
    case 'hours':
      time.setHours(time.getHours() + duration);
      break;
    case 'days':
      time.setDate(time.getDate() + duration);
      break;
    default:
      time.setSeconds(time.getSeconds() + duration);
      break;
  }
  return time;
}
