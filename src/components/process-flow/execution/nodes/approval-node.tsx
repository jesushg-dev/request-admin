import { memo, useEffect, useTransition } from 'react';
import { createExecutionLog } from '@/actions/execution-flow';
import { getApprovalBadgeClass } from '@/constants/execution-flow';
import { useAtom, useAtomValue } from 'jotai';
import { CheckSquare, Clock, Loader2, ShieldUser } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import type { ApprovalNodeData, DecisionOption } from '@/types/execution-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hint } from '@/components/hint';
import { completeSimpleNodeAtom, getTargetNodesByHandlesAtom, pendingDecisionAtom, setPendingDecisionAtom } from '@/components/process-flow/execution/store/use-execution-store';

interface ApprovalNodeProps extends ApprovalNodeData {
  tenantId: string;
  executionId: string;
  nodeId: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isBlocked?: boolean;
}

export const ApprovalNode = memo(({ nodeId, isActive, tenantId, executionId, isCompleted, isBlocked, label, approvers, estimatedTime, timeUnit }: ApprovalNodeProps) => {
  const t = useTranslations('component.flowExecution.execution');
  const [isPending, startTransition] = useTransition();

  const [pendingDecision] = useAtom(pendingDecisionAtom);
  const [, handleDecision] = useAtom(completeSimpleNodeAtom);
  const [, setPendingDecision] = useAtom(setPendingDecisionAtom);
  const getTargets = useAtomValue(getTargetNodesByHandlesAtom);

  const handleDecisionClick = (outcome: string) => {
    startTransition(async () => {
      const toastId = toast.loading(t('approvalNode.toast.processing'));
      try {
        await createExecutionLog(tenantId, executionId, nodeId, 'approval', { outcome, approvers, estimatedTime, timeUnit }, 'success');
        handleDecision(nodeId, outcome);
        toast.success(t('approvalNode.toast.success'), { id: toastId });
      } catch (error) {
        console.error(t('approvalNode.toast.error'), error);
        toast.error(t('approvalNode.toast.error'), { id: toastId });
      }
    });
  };

  useEffect(() => {
    if (!isActive) return;
    const targets = getTargets(nodeId, ['approve', 'reject']);

    const options: DecisionOption[] = [];
    if (targets.reject) {
      options.push({
        label: t('approvalNode.decision.reject'),
        value: targets.reject.id,
        target: targets.reject.data.label,
        bgClass: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
      });
    }
    if (targets.approve) {
      options.push({
        label: t('approvalNode.decision.approve'),
        value: targets.approve.id,
        target: targets.approve.data.label,
        bgClass: 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
      });
    }
    setPendingDecision({ nodeId, type: 'approval', options });
  }, [isActive, nodeId, getTargets, setPendingDecision, t]);

  return (
    <Card
      className={`flex-1 mb-4 ${
        isActive
          ? 'border-emerald-500 border-t-4 bg-emerald-50 dark:bg-emerald-900/50 dark:border-emerald-400'
          : isBlocked
            ? 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 opacity-70'
            : isCompleted
              ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/50 dark:border-emerald-400'
              : 'border-gray-200 dark:border-gray-700'
      }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
            <span className="dark:text-emerald-100">{t('approvalNode.approval')}</span>
          </CardTitle>
          <Badge className={getApprovalBadgeClass({ isActive, isCompleted, isBlocked })}>
            {isActive ? t('status.inProgress') : isCompleted ? t('status.completed') : isBlocked ? t('status.blocked') : t('status.pending')}
          </Badge>
        </div>
        <CardDescription className="dark:text-emerald-200">{label}</CardDescription>
      </CardHeader>
      <CardContent>
        {approvers && approvers.length > 0 && (
          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100">
            <ShieldUser className="w-3 h-3 mr-1" />
            {approvers.join(', ')}
          </Badge>
        )}
        {/* Estimated time display */}
        <Hint label={t('approvalNode.estimatedTime', { count: estimatedTime, unit: t(`approvalNode.timeUnit.${timeUnit}`) })}>
          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100">
            <Clock className="w-3 h-3 mr-1" />
            {estimatedTime}
          </Badge>
        </Hint>
        <div className="flex flex-wrap gap-2 justify-end">
          {isActive &&
            pendingDecision?.options.map((option) => (
              <Button key={option.value} size="sm" onClick={() => handleDecisionClick(option.value)} className={option.bgClass + ' min-w-[120px]'}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `${option.label} ${option.target ? `(${option.target})` : ''}`}
              </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  );
});

ApprovalNode.displayName = 'ApprovalNode';
