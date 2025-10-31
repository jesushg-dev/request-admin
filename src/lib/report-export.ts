import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { AreaDistribution, MonthlyTrend, OverviewData, SLACompliance, StatusDistribution } from '@/components/common/reports/types';
import type { ExecutionFlowInfo, ExecutionStep } from '@/actions/report';
import type { ReportExportTranslations, ExecutionExportTranslations } from './report-export-translations';

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

interface ExecutionExportData {
  flows: ExecutionFlowInfo[];
  selectedFlow: ExecutionFlowInfo | null;
  flowDetails: { flow: any; steps: ExecutionStep[] } | null;
}

function formatFilename(baseName: string, format: string): string {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  return `${baseName}_${date}_${time}.${format.toLowerCase()}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportReportsToPDF(data: ReportExportData, translations: ReportExportTranslations) {
  const doc = new jsPDF();
  let yPos = 20;

  // Title
  doc.setFontSize(18);
  doc.text(translations.title, 14, yPos);
  yPos += 10;

  // Date Range
  doc.setFontSize(12);
  doc.text(`${translations.periodLabel}: ${data.dateRange}`, 14, yPos);
  yPos += 10;

  // Overview Data
  if (data.overviewData) {
    doc.setFontSize(14);
    doc.text(translations.tabs.overview, 14, yPos);
    yPos += 8;

    const overviewRows = [
      [translations.overview.totalRequests, data.overviewData.totalRequests.toString()],
      [translations.overview.openRequests, data.overviewData.openRequests.toString()],
      [translations.overview.closedRequests, data.overviewData.closedRequests.toString()],
      [translations.overview.overdueRequests, data.overviewData.overdueRequests.toString()],
      [translations.overview.avgResolutionTime, `${data.overviewData.avgResolutionTime.toFixed(2)} ${translations.overview.days}`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [[translations.overview.metric, translations.overview.value]],
      body: overviewRows,
      theme: 'striped',
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Monthly Trends
  if (data.monthlyTrends.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text(translations.tabs.monthlyTrends, 14, yPos);
    yPos += 8;

    const trendsRows = data.monthlyTrends.map((trend) => [trend.month, trend.count.toString()]);

    autoTable(doc, {
      startY: yPos,
      head: [[translations.monthlyTrends.month, translations.monthlyTrends.count]],
      body: trendsRows,
      theme: 'striped',
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Area Distribution
  if (data.areaDistribution.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text(translations.tabs.areas, 14, yPos);
    yPos += 8;

    const areaRows = data.areaDistribution.map((area) => [area.name, area.value.toString()]);

    autoTable(doc, {
      startY: yPos,
      head: [[translations.areas.area, translations.areas.count]],
      body: areaRows,
      theme: 'striped',
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Status Distribution
  if (data.statusDistribution.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text(translations.tabs.status, 14, yPos);
    yPos += 8;

    const statusRows = data.statusDistribution.map((status) => [status.name, status.value.toString()]);

    autoTable(doc, {
      startY: yPos,
      head: [[translations.status.status, translations.status.count]],
      body: statusRows,
      theme: 'striped',
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // SLA Compliance
  if (data.slaCompliance.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text(translations.sla.title, 14, yPos);
    yPos += 8;

    const slaRows = data.slaCompliance.map((sla) => [sla.name, `${sla.cumplimiento.toFixed(1)}%`]);

    autoTable(doc, {
      startY: yPos,
      head: [[translations.sla.category, translations.sla.compliance]],
      body: slaRows,
      theme: 'striped',
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Response Time Data
  if (data.responseTimeData.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text(translations.performance.chartTitle, 14, yPos);
    yPos += 8;

    const responseRows = data.responseTimeData.map((item) => [item.name, `${item.tiempo.toFixed(2)} ${translations.performance.timeDays}`]);

    autoTable(doc, {
      startY: yPos,
      head: [[translations.performance.category, translations.performance.timeDays]],
      body: responseRows,
      theme: 'striped',
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Workflow Data
  if (data.workflowData.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text(translations.workflows.chartTitle, 14, yPos);
    yPos += 8;

    const workflowRows = data.workflowData.map((item) => [item.name, item.value.toString()]);

    autoTable(doc, {
      startY: yPos,
      head: [[translations.workflows.workflow, translations.workflows.requests]],
      body: workflowRows,
      theme: 'striped',
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Alerts Data
  if (data.alertsData.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text(translations.alerts.title, 14, yPos);
    yPos += 8;

    const alertsRows = data.alertsData.map((alert) => [alert.type, alert.statusName, alert.count.toString()]);

    autoTable(doc, {
      startY: yPos,
      head: [[translations.alerts.levels.type, translations.alerts.levels.status, translations.alerts.levels.count]],
      body: alertsRows,
      theme: 'striped',
    });
  }

  doc.save(formatFilename('reportes', 'pdf'));
}

export function exportReportsToExcel(data: ReportExportData, translations: ReportExportTranslations) {
  const workbook = XLSX.utils.book_new();

  // Overview Sheet
  if (data.overviewData) {
    const overviewData = [
      [translations.overview.metric, translations.overview.value],
      [translations.overview.totalRequests, data.overviewData.totalRequests],
      [translations.overview.openRequests, data.overviewData.openRequests],
      [translations.overview.closedRequests, data.overviewData.closedRequests],
      [translations.overview.overdueRequests, data.overviewData.overdueRequests],
      [translations.overview.avgResolutionTime, `${data.overviewData.avgResolutionTime.toFixed(2)} ${translations.overview.days}`],
    ];
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, translations.tabs.overview);
  }

  // Monthly Trends Sheet
  if (data.monthlyTrends.length > 0) {
    const trendsData = [[translations.monthlyTrends.month, translations.monthlyTrends.count], ...data.monthlyTrends.map((trend) => [trend.month, trend.count])];
    const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
    XLSX.utils.book_append_sheet(workbook, trendsSheet, translations.tabs.monthlyTrends);
  }

  // Area Distribution Sheet
  if (data.areaDistribution.length > 0) {
    const areaData = [[translations.areas.area, translations.areas.count], ...data.areaDistribution.map((a) => [a.name, a.value])];
    const areaSheet = XLSX.utils.aoa_to_sheet(areaData);
    XLSX.utils.book_append_sheet(workbook, areaSheet, translations.tabs.areas);
  }

  // Status Distribution Sheet
  if (data.statusDistribution.length > 0) {
    const statusData = [[translations.status.status, translations.status.count], ...data.statusDistribution.map((s) => [s.name, s.value])];
    const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
    XLSX.utils.book_append_sheet(workbook, statusSheet, translations.tabs.status);
  }

  // SLA Compliance Sheet
  if (data.slaCompliance.length > 0) {
    const slaData = [[translations.sla.category, translations.sla.compliance], ...data.slaCompliance.map((s) => [s.name, `${s.cumplimiento.toFixed(1)}%`])];
    const slaSheet = XLSX.utils.aoa_to_sheet(slaData);
    XLSX.utils.book_append_sheet(workbook, slaSheet, translations.sla.title);
  }

  // Response Time Sheet
  if (data.responseTimeData.length > 0) {
    const responseData = [[translations.performance.category, translations.performance.timeDays], ...data.responseTimeData.map((r) => [r.name, r.tiempo])];
    const responseSheet = XLSX.utils.aoa_to_sheet(responseData);
    XLSX.utils.book_append_sheet(workbook, responseSheet, translations.performance.chartTitle);
  }

  // Workflow Sheet
  if (data.workflowData.length > 0) {
    const workflowData = [[translations.workflows.workflow, translations.workflows.requests], ...data.workflowData.map((w) => [w.name, w.value])];
    const workflowSheet = XLSX.utils.aoa_to_sheet(workflowData);
    XLSX.utils.book_append_sheet(workbook, workflowSheet, translations.workflows.chartTitle);
  }

  // Alerts Sheet
  if (data.alertsData.length > 0) {
    const alertsData = [[translations.alerts.levels.type, translations.alerts.levels.status, translations.alerts.levels.count], ...data.alertsData.map((a) => [a.type, a.statusName, a.count])];
    const alertsSheet = XLSX.utils.aoa_to_sheet(alertsData);
    XLSX.utils.book_append_sheet(workbook, alertsSheet, translations.alerts.title);
  }

  // Metadata Sheet
  const metadataData = [[translations.metadata.key, translations.metadata.value], [translations.metadata.dateRange, data.dateRange], [translations.metadata.exportDate, new Date().toISOString()]];
  const metadataSheet = XLSX.utils.aoa_to_sheet(metadataData);
  XLSX.utils.book_append_sheet(workbook, metadataSheet, translations.metadata.title);

  const excelBlob = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBlob], { type: 'application/octet-stream' });
  downloadBlob(blob, formatFilename('reportes', 'xlsx'));
}

export function exportReportsToJSON(data: ReportExportData) {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      dateRange: data.dateRange,
    },
    overview: data.overviewData,
    monthlyTrends: data.monthlyTrends,
    areaDistribution: data.areaDistribution,
    statusDistribution: data.statusDistribution,
    slaCompliance: data.slaCompliance,
    responseTime: data.responseTimeData,
    workflows: data.workflowData,
    alerts: data.alertsData,
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, formatFilename('reportes', 'json'));
}

export function exportExecutionToPDF(data: ExecutionExportData, translations: ExecutionExportTranslations) {
  const doc = new jsPDF();
  let yPos = 20;

  // Title
  doc.setFontSize(18);
  doc.text(translations.title, 14, yPos);
  yPos += 10;

  // Flows List
  doc.setFontSize(14);
  doc.text(translations.models.title, 14, yPos);
  yPos += 8;

  if (data.flows.length > 0) {
    const flowsRows = data.flows.map((flow) => [
      flow.name,
      `v${flow.version}`,
      flow.executionCount.toString(),
      `${flow.successRate}%`,
      `${flow.avgCompletionTime.toFixed(2)} ${translations.models.days}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [[translations.models.name, translations.models.version, translations.models.executions, translations.models.successRate, translations.models.avgTime]],
      body: flowsRows,
      theme: 'striped',
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Selected Flow Details
  if (data.selectedFlow && data.flowDetails) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text(`${translations.details.title}: ${data.selectedFlow.name}`, 14, yPos);
    yPos += 8;

    // Flow Info
    const flowInfoRows = [
      [translations.details.version, data.selectedFlow.version.toString()],
      [translations.details.nodes, data.selectedFlow.nodeCount.toString()],
      [translations.details.executions, data.selectedFlow.executionCount.toString()],
      [translations.details.successRate, `${data.selectedFlow.successRate}%`],
      [translations.details.avgTime, `${data.selectedFlow.avgCompletionTime.toFixed(2)} ${translations.models.days}`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [[translations.details.property, translations.details.value]],
      body: flowInfoRows,
      theme: 'striped',
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Steps
    if (data.flowDetails.steps.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text(translations.steps.title, 14, yPos);
      yPos += 8;

      const stepsRows = data.flowDetails.steps.map((step, index) => [
        (index + 1).toString(),
        step.name,
        `${step.avgTime.toFixed(1)} ${translations.steps.days}`,
        `${step.compliance.toFixed(1)}%`,
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [[translations.steps.order, translations.steps.name, translations.steps.avgTime, translations.steps.compliance]],
        body: stepsRows,
        theme: 'striped',
      });
    }
  }

  doc.save(formatFilename('execucion', 'pdf'));
}

export function exportExecutionToExcel(data: ExecutionExportData, translations: ExecutionExportTranslations) {
  const workbook = XLSX.utils.book_new();

  // Flows Sheet
  if (data.flows.length > 0) {
    const flowsData = [
      [translations.models.name, translations.models.version, translations.models.executions, translations.models.successRate, translations.models.avgTime],
      ...data.flows.map((flow) => [flow.name, `v${flow.version}`, flow.executionCount, `${flow.successRate}%`, `${flow.avgCompletionTime.toFixed(2)} ${translations.models.days}`]),
    ];
    const flowsSheet = XLSX.utils.aoa_to_sheet(flowsData);
    XLSX.utils.book_append_sheet(workbook, flowsSheet, translations.models.title);
  }

  // Selected Flow Details
  if (data.selectedFlow && data.flowDetails) {
    // Flow Info Sheet
    const flowInfoData = [
      [translations.details.property, translations.details.value],
      [translations.details.version, data.selectedFlow.version],
      [translations.details.nodes, data.selectedFlow.nodeCount],
      [translations.details.executions, data.selectedFlow.executionCount],
      [translations.details.successRate, `${data.selectedFlow.successRate}%`],
      [translations.details.avgTime, `${data.selectedFlow.avgCompletionTime.toFixed(2)} ${translations.models.days}`],
    ];
    const flowInfoSheet = XLSX.utils.aoa_to_sheet(flowInfoData);
    XLSX.utils.book_append_sheet(workbook, flowInfoSheet, `${data.selectedFlow.name} - ${translations.details.title}`);

    // Steps Sheet
    if (data.flowDetails.steps.length > 0) {
      const stepsData = [
        [translations.steps.order, translations.steps.name, translations.steps.avgTime, translations.steps.compliance],
        ...data.flowDetails.steps.map((step, index) => [index + 1, step.name, `${step.avgTime.toFixed(1)} ${translations.steps.days}`, `${step.compliance.toFixed(1)}%`]),
      ];
      const stepsSheet = XLSX.utils.aoa_to_sheet(stepsData);
      XLSX.utils.book_append_sheet(workbook, stepsSheet, `${data.selectedFlow.name} - ${translations.steps.title}`);
    }
  }

  const excelBlob = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBlob], { type: 'application/octet-stream' });
  downloadBlob(blob, formatFilename('execucion', 'xlsx'));
}

export function exportExecutionToJSON(data: ExecutionExportData) {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
    },
    flows: data.flows,
    selectedFlow: data.selectedFlow,
    flowDetails: data.flowDetails,
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, formatFilename('execucion', 'json'));
}
