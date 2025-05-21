'use client';

import { useTranslations } from 'next-intl';

import type { FlowNode, PendingDecision } from '@/types/execution-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CurrentNodeCardProps {
  node: FlowNode;
  pendingDecision: PendingDecision | null;
  onDecision: (outcome: string) => void;
}

export function CurrentNodeCard({ node, pendingDecision, onDecision }: CurrentNodeCardProps) {
  const t = useTranslations('component.flowExecution.execution.currentNodeCard');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('title')}</CardTitle>
          <Badge className="bg-blue-100 text-blue-800">{t('inProgress')}</Badge>
        </div>
        <CardDescription>
          {node.type ? node.type.charAt(0).toUpperCase() + node.type.slice(1) : t('unknownType')}: {node.data.label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderNodeDetails(node, t)}

        {pendingDecision && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
            <p className="text-sm font-medium mb-2">{t('decisionRequired')}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {pendingDecision.options.map((option, index) => (
                <div key={index} className="flex flex-col gap-1 w-full">
                  <Button size="sm" variant={index === 0 ? 'default' : 'outline'} onClick={() => onDecision(option.value)} className="w-full">
                    {option.label}
                  </Button>
                  {option.target && <p className="text-xs text-muted-foreground text-center">{t('next', { target: option.target })}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// function to render specify details of node
function renderNodeDetails(node: FlowNode, t: ReturnType<typeof useTranslations>) {
  switch (node.type) {
    case 'step':
      return (
        <div className="space-y-2">
          {node.data.action && (
            <div>
              <p className="text-sm font-medium">{t('action')}:</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{node.data.action}</p>
            </div>
          )}
          {node.data.responsible && (
            <div>
              <p className="text-sm font-medium">{t('responsible')}:</p>
              <p className="text-sm">{node.data.responsible}</p>
            </div>
          )}
          {node.data.estimatedTime && (
            <div>
              <p className="text-sm font-medium">{t('estimatedTime')}:</p>
              <p className="text-sm">
                {node.data.estimatedTime} {node.data.timeUnit}
              </p>
            </div>
          )}
        </div>
      );

    case 'condition':
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('expression')}:</p>
          <p className="text-sm bg-gray-50 p-2 rounded">{node.data.expression || t('notDefined')}</p>
        </div>
      );

    case 'loop':
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('condition')}:</p>
          <p className="text-sm bg-gray-50 p-2 rounded">{node.data.condition || t('notDefined')}</p>
          <p className="text-sm font-medium">{t('maxIterations')}:</p>
          <p className="text-sm">{node.data.maxIterations}</p>
        </div>
      );

    case 'task':
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('type')}:</p>
          <p className="text-sm">{node.data.type || 'manual'}</p>
          {node.data.details && (
            <div>
              <p className="text-sm font-medium">{t('details')}:</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{node.data.details}</p>
            </div>
          )}
        </div>
      );

    case 'approval':
      return (
        <div className="space-y-2">
          {node.data.approvers && node.data.approvers.length > 0 && (
            <div>
              <p className="text-sm font-medium">{t('approvers')}:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {node.data.approvers.map((approver: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-gray-50">
                    {approver}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 'notification':
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('channel')}:</p>
          <p className="text-sm">{node.data.channel || 'email'}</p>
          {node.data.message && (
            <div>
              <p className="text-sm font-medium">{t('message')}:</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{node.data.message}</p>
            </div>
          )}
        </div>
      );

    case 'timer':
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('duration')}:</p>
          <p className="text-sm">
            {node.data.duration} {node.data.timeUnit}
          </p>
        </div>
      );

    default:
      return <p className="text-sm text-muted-foreground">{t('noDetails')}</p>;
  }
}
