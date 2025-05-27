import { useEffect, useState, useTransition } from 'react';
import { createExecutionLog } from '@/actions/execution-flow';
import { useAtom } from 'jotai';
import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import type { NotificationNodeData } from '@/types/execution-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { completeSimpleNodeAtom } from '../store/use-execution-store';

interface NotificationNodeProps extends NotificationNodeData {
  nodeId: string;
  tenantId: string;
  executionId: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isBlocked?: boolean;
}

type NotificationStatus = 'idle' | 'sending' | 'success' | 'error';

export function NotificationNode({ nodeId, tenantId, executionId, isActive, isCompleted, isBlocked, label, channel, message }: NotificationNodeProps) {
  const t = useTranslations('component.flowExecution.execution');
  const [isPending, startTransition] = useTransition();
  const [, handleContinue] = useAtom(completeSimpleNodeAtom);

  const [status, setStatus] = useState<NotificationStatus>('idle');

  useEffect(() => {
    if (isActive && status === 'idle' && !isCompleted && !isBlocked) {
      handleSendNotification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const handleSendNotification = () => {
    setStatus('sending');
    startTransition(async () => {
      const toastId = toast.loading(t('notificationNode.toast.sending'));
      try {
        await createExecutionLog(tenantId, executionId, nodeId, 'notification', { channel, message }, 'success');
        setStatus('success');
        handleContinue(nodeId);
        toast.success(t('notificationNode.toast.success'), { id: toastId });
      } catch (error) {
        setStatus('error');
        console.error(t('notificationNode.toast.error'), error);
        toast.error(t('notificationNode.toast.error'), { id: toastId });
      }
    });
  };

  const handleSkip = () => {
    setStatus('idle');
    handleContinue(nodeId);
    toast.info(t('notificationNode.toast.skipped'));
  };

  return (
    <Card
      className={`flex-1 mb-4 border-t-4 ${
        isActive
          ? 'border-pink-300 bg-pink-50 dark:bg-pink-900 dark:border-pink-600'
          : isBlocked
            ? 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 opacity-70'
            : isCompleted
              ? 'border-pink-200 bg-pink-50 dark:bg-pink-900 dark:border-pink-600'
              : 'border-gray-200 dark:border-gray-700'
      }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-pink-600 dark:text-pink-300" />
            <span className="text-black dark:text-white">{t('notificationNode.title')}</span>
          </CardTitle>
          <Badge variant={isActive ? 'default' : isCompleted ? 'success' : isBlocked ? 'secondary' : 'outline'} className={isActive ? 'bg-pink-100 text-black dark:bg-pink-800 dark:text-white' : ''}>
            {isActive ? t('status.inProgress') : isCompleted ? t('status.completed') : isBlocked ? t('status.blocked') : t('status.pending')}
          </Badge>
        </div>
        <CardDescription className="text-black dark:text-white">{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs font-semibold text-black dark:text-white">{t('notificationNode.channel')}</p>
            <p className="text-sm font-normal text-black dark:text-white">{channel}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-black dark:text-white">{t('notificationNode.message')}</p>
            <p className="text-sm font-normal text-black dark:text-white">{message}</p>
          </div>
        </div>
        {isActive && !isCompleted && !isBlocked && (
          <div className="flex flex-wrap gap-2 mt-3">
            {status === 'error' && (
              <Button size="sm" className="bg-pink-600 hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-800 text-white" onClick={handleSendNotification} disabled={isPending}>
                {isPending ? t('notificationNode.sending') : t('notificationNode.retry')}
              </Button>
            )}
            <Button size="sm" variant="outline" className="dark:border-pink-600 dark:hover:bg-pink-900 text-black dark:text-white" onClick={handleSkip} disabled={status === 'sending'}>
              {t('notificationNode.skip')}
            </Button>
          </div>
        )}
        {status === 'sending' && <div className="mt-2 text-black dark:text-white text-sm">{t('notificationNode.sending')}</div>}
        {status === 'error' && <div className="mt-2 text-red-600 dark:text-red-400 text-sm">{t('notificationNode.error')}</div>}
      </CardContent>
    </Card>
  );
}
