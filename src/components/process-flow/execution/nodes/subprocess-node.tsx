import { useTransition } from 'react';
import { createExecutionLog } from '@/actions/execution-flow';
import { useAtom } from 'jotai';
import { GitBranch, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { SubProcessNodeData } from '@/types/execution-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { completeSimpleNodeAtom } from '../store/use-execution-store';

interface SubprocessNodeProps extends SubProcessNodeData {
  nodeId: string;
  tenantId: string;
  executionId: string;
  isActive: boolean;
  isCompleted: boolean;
  isBlocked: boolean;
}

export const SubprocessNode = ({ tenantId, executionId, nodeId, isActive, isCompleted, isBlocked, label, subprocessRef }: SubprocessNodeProps) => {
  const t = useTranslations('component.flowExecution.execution');
  const [isPending, startTransition] = useTransition();
  const [, handleContinue] = useAtom(completeSimpleNodeAtom);

  const handleExecuteSubprocess = () => {
    startTransition(async () => {
      const toastId = toast.loading(t('subprocessNode.toast.executing'));
      try {
        await createExecutionLog(tenantId, executionId, nodeId, 'subprocess', { subprocessRef, label }, 'success');
        handleContinue(nodeId);
        toast.success(t('subprocessNode.toast.success'), { id: toastId });
      } catch (error) {
        console.error(t('subprocessNode.toast.error'), error);
        toast.error(t('subprocessNode.toast.error'), { id: toastId });
      }
    });
  };

  return (
    <Card
      className={`flex-1 mb-4 ${
        isActive
          ? 'border-gray-400 bg-gray-50 dark:bg-gray-800 dark:border-gray-600'
          : isBlocked
            ? 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 opacity-70'
            : isCompleted
              ? 'border-gray-400 bg-gray-50 dark:bg-gray-800 dark:border-gray-600'
              : 'border-gray-200 dark:border-gray-700'
      }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <span className="dark:text-gray-100 text-gray-800">{t('subprocessNode.title')}</span>
          </CardTitle>
          <Badge
            variant={isActive ? 'default' : isCompleted ? 'success' : isBlocked ? 'secondary' : 'outline'}
            className={isActive || isCompleted ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' : ''}>
            {isActive ? t('status.inProgress') : isCompleted ? t('status.completed') : isBlocked ? t('status.blocked') : t('status.pending')}
          </Badge>
        </div>
        <CardDescription className="dark:text-gray-200 text-gray-700">{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('subprocessNode.reference')}</span>
            <div className="text-sm dark:text-gray-100 text-gray-800">{String(subprocessRef)}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                {t('subprocessNode.state')}: {isActive ? t('subprocessNode.running') : isCompleted ? t('status.completed') : isBlocked ? t('status.blocked') : t('status.pending')}
              </Badge>
            </div>
            {isActive && !isCompleted && !isBlocked && (
              <Button onClick={handleExecuteSubprocess} size="sm" className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('subprocessNode.button')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
