import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { GitFork } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { GatewayNodeData } from '@/types/execution-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { edgesAtom, setPendingDecisionAtom } from '../store/use-execution-store';

interface GatewayNodeProps extends GatewayNodeData {
  nodeId: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isBlocked?: boolean;
}

export function GatewayNode({ nodeId, isActive, isCompleted, isBlocked, label }: GatewayNodeProps) {
  const t = useTranslations('component.flowExecution.execution');
  const [, setPendingDecision] = useAtom(setPendingDecisionAtom);
  const [edges] = useAtom(edgesAtom);

  useEffect(() => {
    if (isActive) {
      const outgoingEdges = edges.filter((edge) => edge.source === nodeId);
      setPendingDecision({
        nodeId,
        type: 'gateway',
        options: outgoingEdges.map((edge, index) => ({
          label: t('gatewayNode.decision.path', { number: index + 1 }),
          value: edge.sourceHandle || `path_${index}`,
          target: edge.target || t('gatewayNode.decision.nextStep'),
        })),
      });
    }
  }, [isActive, nodeId, edges, setPendingDecision, t]);

  return (
    <Card
      className={`flex-1 mb-4 ${
        isActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 dark:border-blue-400'
          : isBlocked
            ? 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 opacity-70'
            : isCompleted
              ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/50 dark:border-blue-400'
              : 'border-gray-200 dark:border-gray-700'
      }`}>
      <div className="h-1 bg-blue-500 dark:bg-blue-400"></div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span className="dark:text-blue-100">{t('gatewayNode.gateway')}</span>
          </CardTitle>
          <Badge
            variant={isActive ? 'default' : isCompleted ? 'success' : isBlocked ? 'secondary' : 'outline'}
            className={isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : ''}>
            {isActive ? t('status.inProgress') : isCompleted ? t('status.completed') : isBlocked ? t('status.blocked') : t('status.pending')}
          </Badge>
        </div>
        <CardDescription className="dark:text-blue-200">{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {isActive && (
            <div className="flex flex-wrap gap-2">
              {edges.map((edge, index) => (
                <Button key={edge.id} size="sm" className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                  {t('gatewayNode.decision.path', { number: index + 1 })}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
