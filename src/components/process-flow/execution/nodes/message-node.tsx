import { useCallback, useEffect, useState, useTransition } from 'react';
import { useAtom } from 'jotai';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import type { MessageNodeData } from '@/types/execution-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { completeSimpleNodeAtom } from '../store/use-execution-store';

interface MessageNodeProps extends MessageNodeData {
  nodeId: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isBlocked?: boolean;
  index?: number;
}

type MessageStatus = 'idle' | 'sending' | 'success' | 'error';

export function MessageNode({ nodeId, isActive, isCompleted, isBlocked, index, label, message }: MessageNodeProps) {
  const t = useTranslations('component.flowExecution.execution');
  const [isPending, startTransition] = useTransition();
  const [, handleContinue] = useAtom(completeSimpleNodeAtom);

  const [status, setStatus] = useState<MessageStatus>('idle');

  // Envío automático al activar
  useEffect(() => {
    if (isActive && status === 'idle' && !isCompleted && !isBlocked) {
      handleSendMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const handleSendMessage = useCallback(() => {
    setStatus('sending');
    startTransition(async () => {
      const toastId = toast.loading(t('messageNode.toast.processing'));
      try {
        // Simula envío (reemplaza por tu lógica real)
        await new Promise((resolve, reject) => setTimeout(() => (Math.random() > 0.1 ? resolve(true) : reject(new Error('Error'))), 1500));
        setStatus('success');
        handleContinue(nodeId);
        toast.success(t('messageNode.toast.success'), { id: toastId });
      } catch (error) {
        console.error(t('messageNode.toast.error'), error);
        setStatus('error');
        toast.error(t('messageNode.toast.error'), { id: toastId });
      }
    });
  }, [nodeId, handleContinue, t]);

  const handleSkip = useCallback(() => {
    setStatus('idle');
    handleContinue(nodeId);
    toast.info(t('messageNode.toast.skipped'));
  }, [handleContinue, nodeId, t]);

  return (
    <Card
      className={`flex-1 mb-4 ${
        isActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 dark:border-blue-400'
          : isBlocked
            ? 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 opacity-70'
            : isCompleted
              ? 'border-green-200 bg-green-50 dark:bg-green-900/50 dark:border-green-400'
              : 'border-gray-200 dark:border-gray-700'
      }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {index !== undefined && <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 font-medium">{index + 1}</div>}
            <span className="dark:text-blue-100">{label}</span>
          </CardTitle>
          <Badge
            variant={isActive ? 'default' : isCompleted ? 'success' : isBlocked ? 'secondary' : 'outline'}
            className={isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : ''}>
            {isActive ? t('status.inProgress') : isCompleted ? t('status.completed') : isBlocked ? t('status.blocked') : t('status.pending')}
          </Badge>
        </div>
        <CardDescription className="dark:text-blue-200">{t('messageNode.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('messageNode.message')}</p>
          <p className="text-sm dark:text-blue-100">{message}</p>
        </div>
        {status !== 'idle' && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <p className="text-sm font-medium">{t('messageNode.state')}</p>
            <p className="text-sm">
              {status === 'sending' && t('messageNode.sending')}
              {status === 'success' && t('messageNode.success')}
              {status === 'error' && t('messageNode.error')}
            </p>
          </div>
        )}
        {isActive && !isCompleted && !isBlocked && (
          <div className="flex flex-wrap gap-2 mt-3">
            {status === 'error' && (
              <Button size="sm" className="dark:bg-red-600 dark:hover:bg-red-700" onClick={handleSendMessage} disabled={isPending}>
                {isPending ? t('messageNode.sending') : t('messageNode.retry')}
              </Button>
            )}
            <Button size="sm" variant="outline" className="dark:border-gray-600 dark:hover:bg-gray-800" onClick={handleSkip} disabled={status === 'sending'}>
              {t('messageNode.skip')}
            </Button>
          </div>
        )}
        {status === 'sending' && <div className="mt-2 text-blue-600 dark:text-blue-300 text-sm">{t('messageNode.sending')}</div>}
        {status === 'error' && <div className="mt-2 text-red-600 dark:text-red-400 text-sm">{t('messageNode.error')}</div>}
      </CardContent>
    </Card>
  );
}
