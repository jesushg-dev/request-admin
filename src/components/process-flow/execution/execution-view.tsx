'use client';

import { useCallback, useEffect, type FC } from 'react';
import { ExecutionFlowValues } from '@/services/schemas/execution-flow';
import { useAtom } from 'jotai';
import { Eye, RotateCcw } from 'lucide-react';
import { Locale, useTranslations } from 'next-intl';

import type { ExecutionLogType } from '@/types/zenstackhq/request';
import { isNodeWithEstimatedTime, isStepNode } from '@/lib/execution-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Hint } from '@/components/hint';

import { nodeTypes } from '../flow-builder/nodes';
import { PendingDecisionPanel } from './execution-decision-control';
import { ExecutionHistory } from './execution-history';
import ExecutionViewExportHistory from './execution-view-export-history';
import { ExecutionViewError, ExecutionViewPlaceholder, ExecutionViewSuccess } from './execution-view-state';
import { FlowDiagram } from './flow-diagram';
import { initializeProcessFlowAtom, stateAtom } from './store/use-execution-store';
import WorkflowNodes from './workflow-nodes';

interface ExecutionViewProps {
  locale: Locale;
  tenantId: string;
  executionId: string;
  processFlow?: ExecutionFlowValues;
  executionLogs?: ExecutionLogType[];
}

const ExecutionView: FC<ExecutionViewProps> = ({ locale, tenantId, executionId, processFlow: initialProcessFlow, executionLogs }) => {
  const t = useTranslations('component.flowExecution.execution');

  const [state] = useAtom(stateAtom);
  const [, initializeProcessFlow] = useAtom(initializeProcessFlowAtom);

  const memoizedInitialize = useCallback(() => {
    initializeProcessFlow([initialProcessFlow, locale, executionLogs]);
  }, [initialProcessFlow, locale, executionLogs, initializeProcessFlow]);

  useEffect(() => {
    memoizedInitialize();
  }, [memoizedInitialize]);

  if (state.error) return <ExecutionViewError error={state.error} />;

  if (!state.processFlow) return <ExecutionViewPlaceholder />;

  const currentNode = state.currentNodeId ? state.processFlow.nodes.find((node) => node.id === state.currentNodeId) : null;

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader className="flex w-full">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!state.isComplete && (
              <Button variant="destructive" size="sm" onClick={memoizedInitialize}>
                <RotateCcw className="w-4 h-4 mr-2" /> {t('reset')}
              </Button>
            )}
            <Dialog>
              <Hint label={t('viewDiagram')}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
              </Hint>
              <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>{t('fullFlowDiagram')}</DialogTitle>
                </DialogHeader>
                <FlowDiagram nodes={state.nodes} edges={state.edges} nodeTypes={nodeTypes} />
              </DialogContent>
            </Dialog>
            <ExecutionViewExportHistory />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('totalProgress', { progress: state.progress })}</span>
              <Badge variant="outline">
                {t('stepProgress', {
                  current: state.completedNodeIds.length + (state.currentNodeId && !state.isComplete ? 1 : 0),
                  total: state.processFlow.nodes.length - 1,
                })}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {t('completedSteps', {
                completed: state.completedNodeIds.length,
                total: state.processFlow.nodes.length - 1,
              })}
            </span>
          </div>
          <Progress value={state.progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/*Left column*/}
          <div className="lg:col-span-2 flex flex-col flex-1 overflow-hidden gap-2">
            <div className="flex-1 flex flex-col overflow-auto">
              {state.isComplete && <ExecutionViewSuccess resetExecution={memoizedInitialize} />}
              <WorkflowNodes tenantId={tenantId} executionId={executionId} />
              {state.availableNodes.filter((n) => !n.isCompleted).length === 0 && !state.isComplete && (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-muted-foreground">{t('noAvailableSteps')}</p>
                </div>
              )}
            </div>
          </div>

          {/*Right column*/}
          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            <div className="flex flex-col gap-4 overflow-auto">
              {currentNode && !state.isComplete && (
                <Card>
                  <div className="h-1 bg-blue-500 dark:bg-blue-400"></div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="dark:text-blue-100">{t('currentStep')}</CardTitle>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">{t('inProgress')}</Badge>
                    </div>
                    <CardDescription className="dark:text-blue-200">
                      {currentNode.type ? currentNode.type.charAt(0).toUpperCase() + currentNode.type.slice(1) : ''}: {currentNode.data.label}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isStepNode(currentNode) && <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{currentNode.data.action}</p>}

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {isNodeWithEstimatedTime(currentNode) && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('estimatedTime')}</p>
                          <p className="text-sm dark:text-blue-100">
                            {currentNode.data.estimatedTime} {currentNode.data.timeUnit}
                          </p>
                        </div>
                      )}

                      {isStepNode(currentNode) && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('responsible')}</p>
                          <p className="text-sm dark:text-blue-100">{currentNode.data.responsible}</p>
                        </div>
                      )}
                    </div>

                    <PendingDecisionPanel tenantId={tenantId} executionId={executionId} />
                  </CardContent>
                </Card>
              )}
              <ExecutionHistory executionHistory={state.executionHistory} nodes={state.nodes} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutionView;
