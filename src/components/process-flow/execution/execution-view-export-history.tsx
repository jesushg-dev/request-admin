import { FC, useCallback } from 'react';
import { useAtom } from 'jotai';
import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Hint } from '@/components/hint';

import { executionHistoryAtom } from './store/use-execution-store';

const ExecutionViewExportHistory: FC = () => {
  const [executionHistory] = useAtom(executionHistoryAtom);
  const t = useTranslations('component.flowExecution.exportHistory');

  const exportExecutionHistory = useCallback(() => {
    if (executionHistory.length === 0) return;

    const csvHeaders = t('csvHeaders');
    const csvRows = executionHistory
      .map((entry) => {
        const date = entry.timestamp.toLocaleDateString();
        const time = entry.timestamp.toLocaleTimeString();
        const action = entry.action.replace(/,/g, ';');
        const details = entry.details?.replace(/,/g, ';') || '';

        return `${date},${time},${entry.nodeId},${action},${details}`;
      })
      .join('\n');

    const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = t('fileName', {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [executionHistory, t]);

  return (
    <Hint label={t('exportHistory')}>
      <Button variant="outline" size="sm" onClick={exportExecutionHistory} disabled={executionHistory.length === 0}>
        <Download className="w-4 h-4" />
      </Button>
    </Hint>
  );
};
export default ExecutionViewExportHistory;
