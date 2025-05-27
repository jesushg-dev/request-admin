import { useTransition } from 'react';
import { createExecutionLog } from '@/actions/execution-flow';
import { useAtom } from 'jotai';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { completeSimpleNodeAtom, pendingDecisionAtom } from './store/use-execution-store';

interface PendingDecisionPanelProps {
  tenantId: string;
  executionId: string;
}

export const PendingDecisionPanel: React.FC<PendingDecisionPanelProps> = ({ tenantId, executionId }) => {
  const t = useTranslations('component.flowExecution.execution');
  const [pendingDecision] = useAtom(pendingDecisionAtom);
  const [, handleDecision] = useAtom(completeSimpleNodeAtom);
  const [isLoading, startTransition] = useTransition();

  const handleDecisionClick = (outcome: string) => {
    if (!pendingDecision) return;

    startTransition(async () => {
      const toastId = toast.loading(t('conditionNode.toast.processing'));
      try {
        await createExecutionLog(tenantId, executionId, pendingDecision.nodeId, 'approval', { outcome }, 'success');
        handleDecision(pendingDecision.nodeId, outcome);
        toast.success(t('conditionNode.toast.success'), { id: toastId });
      } catch (error) {
        console.error(t('conditionNode.toast.error'), error);
        toast.error(t('conditionNode.toast.error'), { id: toastId });
      }
    });
  };

  if (!pendingDecision || pendingDecision.options.length === 0) {
    return null; // No pending decision or options available
  }

  return (
    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-md border border-yellow-200 dark:border-yellow-700">
      <p className="text-sm font-medium mb-2 dark:text-yellow-100">{t('decisionRequired')}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        {pendingDecision.options.map((option, index) => (
          <div key={index} className="flex flex-col gap-1 w-full">
            <Button size="sm" className={option.bgClass + ' w-full'} onClick={() => handleDecisionClick(option.value)} disabled={isLoading}>
              {option.label}
            </Button>
            {option.target && <p className="text-xs text-muted-foreground dark:text-yellow-200 text-center">{t('nextStep', { step: option.target })}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
