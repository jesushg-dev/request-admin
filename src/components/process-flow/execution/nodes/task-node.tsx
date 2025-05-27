import { useTransition } from 'react';
import { createExecutionLog } from '@/actions/execution-flow';
import { useAtom } from 'jotai';
import { ClipboardList, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { TaskNodeData } from '@/types/execution-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { completeSimpleNodeAtom } from '../store/use-execution-store';

interface TaskNodeProps extends TaskNodeData {
  nodeId: string;
  tenantId: string;
  executionId: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isBlocked?: boolean;
}

export function TaskNode({ nodeId, tenantId, executionId, isActive, isCompleted, isBlocked, label, type, estimatedTime, timeUnit }: TaskNodeProps) {
  const t = useTranslations('component.flowExecution.execution');
  const [isPending, startTransition] = useTransition();
  const [, handleContinue] = useAtom(completeSimpleNodeAtom);

  const colors = getTaskColors(type);

  const handleExecuteTask = () => {
    startTransition(async () => {
      const toastId = toast.loading(t('taskNode.toast.executing'));
      try {
        // Aquí puedes registrar logs en la base de datos
        await createExecutionLog(tenantId, executionId, nodeId, 'task', { type, estimatedTime, timeUnit }, 'success');
        handleContinue(nodeId);
        toast.success(t('taskNode.toast.success'), { id: toastId });
      } catch (error) {
        console.error(t('taskNode.toast.error'), error);
        toast.error(t('taskNode.toast.error'), { id: toastId });
      }
    });
  };

  return (
    <Card
      className={`flex-1 mb-4 border-t-4 ${
        isActive || isCompleted
          ? `${colors.border} ${colors.bg} ${colors.borderDark} ${colors.bgDark}`
          : isBlocked
            ? 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 opacity-70'
            : 'border-gray-200 dark:border-gray-700'
      }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className={`w-4 h-4 ${isActive || isCompleted ? `${colors.icon} ${colors.iconDark}` : 'text-blue-500 dark:text-blue-400'}`} />
            <span className="dark:text-blue-100">{t('taskNode.title')}</span>
          </CardTitle>
          <Badge
            variant={isActive ? 'default' : isCompleted ? 'success' : isBlocked ? 'secondary' : 'outline'}
            className={isActive || isCompleted ? colors.badge : isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : ''}>
            {isActive ? t('status.inProgress') : isCompleted ? t('status.completed') : isBlocked ? t('status.blocked') : t('status.pending')}
          </Badge>
        </div>
        <CardDescription className="dark:text-blue-200">{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('taskNode.estimatedTime')}</p>
              <p className="text-sm dark:text-gray-200">
                {estimatedTime} {timeUnit}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('taskNode.type')}</p>
              <p className="text-sm dark:text-gray-200">{type}</p>
            </div>
          </div>
          {isActive && !isCompleted && !isBlocked && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className={colors.button} onClick={handleExecuteTask} disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('taskNode.button')}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const getTaskColors = (type: string) => {
  switch (type) {
    case 'manual':
      return {
        border: 'border-indigo-300',
        bg: 'bg-indigo-50',
        borderDark: 'dark:border-indigo-600',
        bgDark: 'dark:bg-indigo-900/50',
        bar: 'bg-indigo-500',
        barDark: 'dark:bg-indigo-400',
        icon: 'text-indigo-600',
        iconDark: 'dark:text-indigo-300',
        badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100',
        button: 'bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700',
      };
    case 'automatic':
      return {
        border: 'border-green-300',
        bg: 'bg-green-50',
        borderDark: 'dark:border-green-600',
        bgDark: 'dark:bg-green-900/50',
        bar: 'bg-green-500',
        barDark: 'dark:bg-green-400',
        icon: 'text-green-600',
        iconDark: 'dark:text-green-300',
        badge: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
        button: 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
      };
    case 'api':
      return {
        border: 'border-cyan-300',
        bg: 'bg-cyan-50',
        borderDark: 'dark:border-cyan-600',
        bgDark: 'dark:bg-cyan-900/50',
        bar: 'bg-cyan-500',
        barDark: 'dark:bg-cyan-400',
        icon: 'text-cyan-600',
        iconDark: 'dark:text-cyan-300',
        badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-100',
        button: 'bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700',
      };
    case 'rpa':
      return {
        border: 'border-orange-300',
        bg: 'bg-orange-50',
        borderDark: 'dark:border-orange-600',
        bgDark: 'dark:bg-orange-900/50',
        bar: 'bg-orange-500',
        barDark: 'dark:bg-orange-400',
        icon: 'text-orange-600',
        iconDark: 'dark:text-orange-300',
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100',
        button: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700',
      };
    default:
      return {
        border: 'border-indigo-300',
        bg: 'bg-indigo-50',
        borderDark: 'dark:border-indigo-600',
        bgDark: 'dark:bg-indigo-900/50',
        bar: 'bg-indigo-500',
        barDark: 'dark:bg-indigo-400',
        icon: 'text-indigo-600',
        iconDark: 'dark:text-indigo-300',
        badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100',
        button: 'bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700',
      };
  }
};
