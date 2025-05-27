import { memo, useEffect, useTransition } from 'react';
import { createExecutionLog } from '@/actions/execution-flow';
import { useAtom, useAtomValue } from 'jotai';
import { GitBranch, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import type { ConditionNodeData, DecisionOption } from '@/types/execution-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { completeSimpleNodeAtom, getTargetNodesByHandlesAtom, pendingDecisionAtom, setPendingDecisionAtom } from '../store/use-execution-store';

interface ConditionNodeProps extends ConditionNodeData {
  tenantId: string;
  executionId: string;
  nodeId: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isBlocked?: boolean;
}

export const ConditionNode = memo(({ tenantId, executionId, nodeId, isActive, isCompleted, expression, isBlocked, label }: ConditionNodeProps) => {
  const t = useTranslations('component.flowExecution.execution');
  const [isPending, startTransition] = useTransition();

  const getTargets = useAtomValue(getTargetNodesByHandlesAtom);
  const [pendingDecision] = useAtom(pendingDecisionAtom);
  const [, setPendingDecision] = useAtom(setPendingDecisionAtom);
  const [, handleDecision] = useAtom(completeSimpleNodeAtom);

  const handleDecisionClick = (outcome: string) => {
    startTransition(async () => {
      const toastId = toast.loading(t('conditionNode.toast.processing'));
      try {
        await createExecutionLog(tenantId, executionId, nodeId, 'condition', { outcome }, 'success');
        handleDecision(nodeId, outcome);
        toast.success(t('conditionNode.toast.success'), { id: toastId });
      } catch (error) {
        console.error(t('conditionNode.toast.error'), error);
        toast.error(t('conditionNode.toast.error'), { id: toastId });
      }
    });
  };

  useEffect(() => {
    if (!isActive) return;
    const targets = getTargets(nodeId, ['yes', 'no']);

    const options: DecisionOption[] = [];
    if (targets.no) {
      options.push({
        label: t('conditionNode.decision.false'),
        value: targets.no.id,
        target: targets.no.data.label,
        bgClass: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
      });
    }
    if (targets.yes) {
      options.push({
        label: t('conditionNode.decision.true'),
        value: targets.yes.id,
        target: targets.yes.data.label,
        bgClass: 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
      });
    }

    setPendingDecision({ nodeId, type: 'condition', options });
  }, [isActive, nodeId, getTargets, setPendingDecision, t]);

  return (
    <Card
      className={`flex-1 mb-4 border-t-4 ${
        isActive
          ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-600'
          : isBlocked
            ? 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 opacity-70'
            : isCompleted
              ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-600'
              : 'border-gray-200 dark:border-gray-700'
      }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-yellow-600 dark:text-yellow-300" />
            <span className="dark:text-yellow-100 text-yellow-800">{t('conditionNode.condition')}</span>
          </CardTitle>
          <Badge
            variant={isActive ? 'default' : isCompleted ? 'success' : isBlocked ? 'secondary' : 'outline'}
            className={isActive ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' : ''}>
            {isActive ? t('status.inProgress') : isCompleted ? t('status.completed') : isBlocked ? t('status.blocked') : t('status.pending')}
          </Badge>
        </div>
        <CardDescription className="dark:text-yellow-100 text-yellow-800">{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs text-yellow-600 dark:text-yellow-300">{t('conditionNode.expression')}</span>
            <div className="text-sm dark:text-yellow-100 text-yellow-800">{expression}</div>
          </div>
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
});

ConditionNode.displayName = 'ConditionNode';
