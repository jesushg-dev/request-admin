import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { ExecutionFlowInfo, ExecutionStep } from '@/actions/report';
import { exportExecutionToPDF, exportExecutionToExcel, exportExecutionToJSON } from '@/lib/report-export';
import type { ExecutionExportTranslations } from '@/lib/report-export-translations';

interface ExecutionExportData {
  flows: ExecutionFlowInfo[];
  selectedFlow: ExecutionFlowInfo | null;
  flowDetails: { flow: any; steps: ExecutionStep[] } | null;
}

export function useExecutionExport() {
  const t = useTranslations('admin.reports.page.executionTab');

  const handleExport = (format: string, data: ExecutionExportData) => {
    try {
      // Formatear TODAS las traducciones durante el render (mejores prácticas de next-intl)
      // Esto asegura que las traducciones estén sincronizadas con el estado actual de la app
      const translations: ExecutionExportTranslations = {
        title: t('title'),
        models: {
          title: t('models.title'),
          name: t('models.name'),
          version: t('models.version'),
          executions: t('models.executions'),
          successRate: t('models.successRate'),
          avgTime: t('models.avgTime'),
          days: t('models.days'),
        },
        details: {
          title: t('details.title'),
          version: t('details.version'),
          nodes: t('details.nodes'),
          executions: t('details.executions'),
          successRate: t('details.successRate'),
          avgTime: t('details.avgTime'),
          property: t('details.property'),
          value: t('details.value'),
        },
        steps: {
          title: t('steps.title'),
          order: t('steps.order'),
          name: t('steps.name'),
          avgTime: t('steps.avgTime'),
          compliance: t('steps.compliance'),
          days: t('steps.days'),
        },
      };

      if (format === 'PDF') {
        exportExecutionToPDF(data, translations);
        toast.success(t('footer.exportSuccess', { format }));
      } else if (format === 'Excel') {
        exportExecutionToExcel(data, translations);
        toast.success(t('footer.exportSuccess', { format }));
      } else if (format === 'JSON') {
        exportExecutionToJSON(data);
        toast.success(t('footer.exportSuccess', { format }));
      }
    } catch (error) {
      console.error('Error exporting execution:', error);
      toast.error(t('footer.exportError'));
    }
  };

  return { handleExport };
}
