import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { exportReportsToExcel, exportReportsToJSON, exportReportsToPDF } from '@/lib/report-export';
import type { ReportExportTranslations } from '@/lib/report-export-translations';
import type { AreaDistribution, MonthlyTrend, OverviewData, SLACompliance, StatusDistribution } from '@/components/common/reports/types';

interface ReportExportData {
  overviewData: OverviewData | null;
  monthlyTrends: MonthlyTrend[];
  areaDistribution: AreaDistribution[];
  statusDistribution: StatusDistribution[];
  slaCompliance: SLACompliance[];
  responseTimeData: { name: string; tiempo: number }[];
  workflowData: { name: string; value: number; color: string }[];
  alertsData: { type: string; count: number; statusName: string; alerts: any[] }[];
  dateRange: string;
}

export function useReportExport() {
  const t = useTranslations('admin.reports.page');

  const handleExport = useCallback(
    (format: string, data: ReportExportData) => {
      const toastId = toast.info(t('export.exporting', { format }));
      try {
        toast.info(t('export.exporting', { format }), { id: toastId });

        // Format all translations during the render (best practices of next-intl)
        // This ensures that the translations are synchronized with the current state of the app
        const translations: ReportExportTranslations = {
          title: t('title'),
          periodLabel: t('period.label'),
          tabs: {
            overview: t('tabs.overview'),
            monthlyTrends: t('tabs.monthlyTrends'),
            areas: t('tabs.areas'),
            status: t('tabs.status'),
          },
          overview: {
            totalRequests: t('overview.totalRequests'),
            openRequests: t('overview.openRequests'),
            closedRequests: t('overview.closedRequests'),
            overdueRequests: t('overview.overdueRequests'),
            avgResolutionTime: t('overview.avgResolutionTime'),
            metric: t('overview.metric'),
            value: t('overview.value'),
            days: t('overview.days'),
          },
          monthlyTrends: {
            month: t('monthlyTrends.month'),
            count: t('monthlyTrends.count'),
          },
          areas: {
            area: t('areas.area'),
            count: t('areas.count'),
          },
          status: {
            status: t('status.status'),
            count: t('status.count'),
          },
          sla: {
            title: t('sla.title'),
            category: t('sla.category'),
            compliance: t('sla.compliance'),
          },
          performance: {
            chartTitle: t('performance.chart.title'),
            category: t('performance.chart.category'),
            timeDays: t('performance.chart.timeDays'),
          },
          workflows: {
            chartTitle: t('workflows.chart.title'),
            workflow: t('workflows.chart.workflow'),
            requests: t('workflows.chart.requests'),
          },
          alerts: {
            title: t('alerts.title'),
            levels: {
              type: t('alerts.levels.type'),
              status: t('alerts.levels.status'),
              count: t('alerts.levels.count'),
            },
          },
          metadata: {
            title: t('metadata.title'),
            key: t('metadata.key'),
            value: t('metadata.value'),
            dateRange: t('metadata.dateRange'),
            exportDate: t('metadata.exportDate'),
          },
        };

        if (format === 'PDF') {
          exportReportsToPDF(data, translations);
          toast.success(t('export.success', { format }), { id: toastId });
        } else if (format === 'Excel') {
          exportReportsToExcel(data, translations);
          toast.success(t('export.success', { format }), { id: toastId });
        } else if (format === 'JSON') {
          exportReportsToJSON(data);
          toast.success(t('export.success', { format }), { id: toastId });
        }
      } catch (error) {
        console.error('Error exporting report:', error);
        toast.error(t('export.error'), { id: toastId });
      }
    },
    [t]
  );

  return { handleExport };
}
