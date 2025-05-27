import { useTransition } from 'react';
import { createExecutionLog } from '@/actions/execution-flow';
import { useAtom } from 'jotai';
import { Loader2, Square } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { EndNodeData } from '@/types/execution-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { completeSimpleNodeAtom } from '../store/use-execution-store';

interface EndNodeProps extends EndNodeData {
  nodeId: string;
  tenantId: string;
  executionId: string;
  isActive: boolean;
  isCompleted: boolean;
  isBlocked: boolean;
}

export const EndNode = ({ nodeId, tenantId, executionId, isActive, isCompleted, isBlocked, label }: EndNodeProps) => {
  const t = useTranslations('component.flowExecution.execution');
  const [isPending, startTransition] = useTransition();
  const [, handleContinue] = useAtom(completeSimpleNodeAtom);

  const handleEnd = () => {
    startTransition(async () => {
      const toastId = toast.loading(t('endNode.toast.processing'));
      try {
        await createExecutionLog(tenantId, executionId, nodeId, 'end', { status: 'ending' }, 'success');
        handleContinue(nodeId);
        toast.success(t('endNode.toast.success'), { id: toastId });
      } catch (error) {
        console.error(t('endNode.toast.error'), error);
        toast.error(t('endNode.toast.error'), { id: toastId });
      }
    });
  };

  return (
    <Card
      className={`flex-1 mb-4 border-t-4 ${
        isActive
          ? 'border-red-500 bg-red-50 dark:bg-red-900/50 dark:border-red-400'
          : isBlocked
            ? 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 opacity-70'
            : isCompleted
              ? 'border-red-200 bg-red-50 dark:bg-red-900/50 dark:border-red-400'
              : 'border-gray-200 dark:border-gray-700'
      }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Square className="w-4 h-4 text-red-500 dark:text-red-400" />
            <span className="dark:text-red-100">{t('endNode.end')}</span>
          </CardTitle>
          <Badge variant={isActive ? 'default' : isCompleted ? 'success' : isBlocked ? 'secondary' : 'outline'} className={isActive ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : ''}>
            {isActive ? t('status.inProgress') : isCompleted ? t('status.completed') : isBlocked ? t('status.blocked') : t('status.pending')}
          </Badge>
        </div>
        <CardDescription className="dark:text-red-200">{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                {t('endNode.status')}: {isActive ? t('endNode.ending') : isCompleted ? t('status.completed') : isBlocked ? t('status.blocked') : t('status.pending')}
              </Badge>
            </div>
            {isActive && !isCompleted && !isBlocked && (
              <Button onClick={handleEnd} disabled={isPending} size="sm" className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('endNode.button')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
