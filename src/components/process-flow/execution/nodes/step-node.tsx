import { useTransition } from 'react';
import { createExecutionLog } from '@/actions/execution-flow';
import { useAtom } from 'jotai';
import { Box, Clock, Loader2, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { StepNodeData } from '@/types/execution-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { completeSimpleNodeAtom } from '../store/use-execution-store';

interface StepNodeProps extends StepNodeData {
  nodeId: string;
  tenantId: string;
  executionId: string;
  isActive: boolean;
  isCompleted: boolean;
  isBlocked: boolean;
}

export const StepNode = ({ label, nodeId, tenantId, executionId, isActive, isCompleted, isBlocked, action, responsible, estimatedTime, sla }: StepNodeProps) => {
  const t = useTranslations('component.flowExecution.execution');
  const [isPending, startTransition] = useTransition();
  const [, handleContinue] = useAtom(completeSimpleNodeAtom);

  const handleExecuteStep = () => {
    startTransition(async () => {
      const toastId = toast.loading(t('stepNode.toast.executing'));
      try {
        await createExecutionLog(tenantId, executionId, nodeId, 'step', { action, responsible, estimatedTime, sla }, 'success');
        handleContinue(nodeId);
        toast.success(t('stepNode.toast.success'), { id: toastId });
      } catch (error) {
        console.error(t('stepNode.toast.error'), error);
        toast.error(t('stepNode.toast.error'), { id: toastId });
      }
    });
  };

  return (
    <Card
      className={`flex-1 mb-4 border-t-4 ${
        isActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-600'
          : isBlocked
            ? 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 opacity-70'
            : isCompleted
              ? 'border-blue-200 bg-blue-50 dark:bg-blue-900 dark:border-blue-600'
              : 'border-gray-200 dark:border-gray-700'
      }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Box className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span className="dark:text-blue-100">{label}</span>
          </CardTitle>
          <Badge
            variant={isActive ? 'default' : isCompleted ? 'success' : isBlocked ? 'secondary' : 'outline'}
            className={isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : ''}>
            {isActive ? t('status.inProgress') : isCompleted ? t('status.completed') : isBlocked ? t('status.blocked') : t('status.pending')}
          </Badge>
        </div>
        <CardDescription className="dark:text-blue-200">{action}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                <User className="w-3 h-3 mr-1" />
                {responsible}
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                <Clock className="w-3 h-3 mr-1" />
                {estimatedTime}
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                SLA: {sla}
              </Badge>
            </div>
            {isActive && !isCompleted && !isBlocked && (
              <Button onClick={handleExecuteStep} disabled={isPending} size="sm" className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('stepNode.button')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
