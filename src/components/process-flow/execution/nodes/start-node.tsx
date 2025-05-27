import { useTransition } from 'react';
import { createExecutionLog } from '@/actions/execution-flow';
import { getApprovalBadgeClass } from '@/constants/execution-flow';
import { useAtom } from 'jotai';
import { Loader2, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { StartNodeData } from '@/types/execution-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { completeSimpleNodeAtom } from '../store/use-execution-store';

interface StartNodeProps extends StartNodeData {
  nodeId: string;
  tenantId: string;
  executionId: string;
  isActive: boolean;
  isBlocked: boolean;
  isCompleted: boolean;
}

export const StartNode = ({ tenantId, executionId, nodeId, isActive, isBlocked, isCompleted, label }: StartNodeProps) => {
  const t = useTranslations('component.flowExecution.execution');
  const [isPending, startTransition] = useTransition();
  const [, handleContinue] = useAtom(completeSimpleNodeAtom);

  const handleStart = () => {
    startTransition(async () => {
      const toastId = toast.loading(t('startNode.toast.starting'));
      try {
        //calling database
        await createExecutionLog(tenantId, executionId, nodeId, 'start', { status: 'starting' }, 'success');
        handleContinue(nodeId);

        toast.success(t('startNode.toast.success'), { id: toastId });
      } catch (error) {
        console.error(t('startNode.toast.error'), error);
        toast.error(t('startNode.toast.error'), { id: toastId });
      }
    });
  };

  return (
    <Card className={`flex-1 mb-4 ${isActive ? 'border-green-500 border-t-4 bg-green-50 dark:bg-green-900/50 dark:border-green-400' : ''}`}>
      <div className="h-1 bg-green-500 dark:bg-green-400"></div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="w-4 h-4 text-green-500 dark:text-green-400" />
            <span className="dark:text-green-100">{t('startNode.title')}</span>
          </CardTitle>
          <Badge className={getApprovalBadgeClass({ isActive, isCompleted, isBlocked })}>{isActive ? t('status.inProgress') : isCompleted ? t('status.completed') : t('status.pending')}</Badge>
        </div>
        <CardDescription className="dark:text-green-200">{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end">
          {!isCompleted && (
            <Button onClick={handleStart} disabled={isPending} size="sm" className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('startNode.button')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
