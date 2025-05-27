import { useEffect, useTransition } from 'react';
import { createExecutionLog } from '@/actions/execution-flow';
import { useAtom, useAtomValue } from 'jotai';
import { Loader2, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import type { DecisionOption, LoopNodeData } from '@/types/execution-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { completeSimpleNodeAtom, getTargetNodesByHandlesAtom, pendingDecisionAtom, setPendingDecisionAtom } from '../store/use-execution-store';

interface LoopNodeProps extends LoopNodeData {
  tenantId: string;
  executionId: string;
  nodeId: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isBlocked?: boolean;
}

export function LoopNode({ nodeId, tenantId, executionId, isActive, isCompleted, isBlocked, label, condition, maxIterations }: LoopNodeProps) {
  const t = useTranslations('component.flowExecution.execution');
  const [isPending, startTransition] = useTransition();
  const [pendingDecision] = useAtom(pendingDecisionAtom);
  const [, handleDecision] = useAtom(completeSimpleNodeAtom);
  const [, setPendingDecision] = useAtom(setPendingDecisionAtom);
  const getTargets = useAtomValue(getTargetNodesByHandlesAtom);

  useEffect(() => {
    if (!isActive) return;
    const targets = getTargets(nodeId, ['success', 'error']);

    const options: DecisionOption[] = [];
    if (targets.success) {
      options.push({
        label: t('loopNode.exitLoop'),
        value: targets.success.id,
        target: targets.success.data.label,
        bgClass: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
      });
    }
    if (targets.error) {
      options.push({
        label: t('loopNode.continueLoop'),
        value: targets.error.id,
        target: targets.error.data.label,
        bgClass: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
      });
    }

    setPendingDecision({ nodeId, type: 'loop', options });
  }, [isActive, nodeId, getTargets, setPendingDecision, t]);

  const handleDecisionClick = (outcome: string) => {
    startTransition(async () => {
      const toastId = toast.loading(t('loopNode.toast.processing'));
      try {
        await createExecutionLog(tenantId, executionId, nodeId, 'loop', { outcome, condition, maxIterations }, 'success');
        handleDecision(nodeId, outcome);
        toast.success(t('loopNode.toast.success'), { id: toastId });
      } catch (error) {
        console.error(t('loopNode.toast.error'), error);
        toast.error(t('loopNode.toast.error'), { id: toastId });
      }
    });
  };

  return (
    <Card
      className={`flex-1 mb-4 ${
        isActive
          ? 'border-purple-300 border-t-4 bg-purple-50 dark:bg-purple-900 dark:border-purple-600'
          : isBlocked
            ? 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 opacity-70'
            : isCompleted
              ? 'border-purple-200 bg-purple-50 dark:bg-purple-900 dark:border-purple-600'
              : 'border-gray-200 dark:border-gray-700'
      }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-300" />
            <span className="text-black dark:text-white">{t('loopNode.loop')}</span>
          </CardTitle>
          <Badge
            variant={isActive ? 'default' : isCompleted ? 'success' : isBlocked ? 'secondary' : 'outline'}
            className={isActive ? 'bg-purple-100 text-black dark:bg-purple-800 dark:text-white' : ''}>
            {isActive ? t('status.inProgress') : isCompleted ? t('status.completed') : isBlocked ? t('status.blocked') : t('status.pending')}
          </Badge>
        </div>
        <CardDescription className="text-black dark:text-white">{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs text-black dark:text-white">{t('loopNode.condition')}</span>
            <div className="text-sm text-black dark:text-white">{condition}</div>
          </div>
          {maxIterations && <div className="text-xs text-black dark:text-white">🔁 {maxIterations}</div>}
          <div className="flex flex-wrap gap-2 justify-end">
            {isActive &&
              pendingDecision?.options.map((option) => (
                <Button key={option.value} size="sm" onClick={() => handleDecisionClick(option.value)} className={option.bgClass + ' min-w-[120px]'}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `${option.label} ${option.target ? `(${option.target})` : ''}`}
                </Button>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
