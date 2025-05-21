import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ExecutionViewErrorProps {
  error: string;
}

const ExecutionViewError: React.FC<ExecutionViewErrorProps> = ({ error }) => {
  const t = useTranslations('component.flowExecution.execution.executionViewError');
  return (
    <div className="container py-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      <div className="mt-4">
        <p>{t('howToCreate')}</p>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>{t('stepBuilder')}</li>
          <li>{t('stepDesign')}</li>
          <li>{t('stepValidate')}</li>
          <li>{t('stepReturn')}</li>
        </ol>
      </div>
    </div>
  );
};

export default ExecutionViewError;

interface ExecutionViewSuccessProps {
  completedNodeIds: string[];
  executionHistory: any[];
  calculateTotalTime: () => number;
  resetExecution: () => void;
}

export const ExecutionViewSuccess: React.FC<ExecutionViewSuccessProps> = ({ completedNodeIds, executionHistory, calculateTotalTime, resetExecution }) => {
  const t = useTranslations('component.flowExecution.execution.executionViewSuccess');
  return (
    <Card>
      <div className="h-1 bg-green-500"></div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{t('title')}</CardTitle>
          <Badge className="bg-green-100 text-green-800">{t('finished')}</Badge>
        </div>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">{t('summary')}</p>
            <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
              <li>{t('completedNodes', { count: completedNodeIds.length })}</li>
              <li>{t('totalTime', { minutes: calculateTotalTime() })}</li>
              <li>{t('executedSteps', { count: executionHistory.length })}</li>
            </ul>
          </div>
          <Button onClick={resetExecution} size="sm" className="w-full mt-2" variant="destructive">
            <AlertTriangle className="w-4 h-4 mr-2" /> {t('reset')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
