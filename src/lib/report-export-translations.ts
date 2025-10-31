/**
 * Interfaz para las traducciones formateadas de los reportes.
 * Estas traducciones deben formatearse durante el render (en los hooks)
 * siguiendo las mejores prácticas de next-intl.
 */
export interface ReportExportTranslations {
  title: string;
  periodLabel: string;
  tabs: {
    overview: string;
    monthlyTrends: string;
    areas: string;
    status: string;
  };
  overview: {
    totalRequests: string;
    openRequests: string;
    closedRequests: string;
    overdueRequests: string;
    avgResolutionTime: string;
    metric: string;
    value: string;
    days: string;
  };
  monthlyTrends: {
    month: string;
    count: string;
  };
  areas: {
    area: string;
    count: string;
  };
  status: {
    status: string;
    count: string;
  };
  sla: {
    title: string;
    category: string;
    compliance: string;
  };
  performance: {
    chartTitle: string;
    category: string;
    timeDays: string;
  };
  workflows: {
    chartTitle: string;
    workflow: string;
    requests: string;
  };
  alerts: {
    title: string;
    levels: {
      type: string;
      status: string;
      count: string;
    };
  };
  metadata: {
    title: string;
    key: string;
    value: string;
    dateRange: string;
    exportDate: string;
  };
}

export interface ExecutionExportTranslations {
  title: string;
  models: {
    title: string;
    name: string;
    version: string;
    executions: string;
    successRate: string;
    avgTime: string;
    days: string;
  };
  details: {
    title: string;
    version: string;
    nodes: string;
    executions: string;
    successRate: string;
    avgTime: string;
    property: string;
    value: string;
  };
  steps: {
    title: string;
    order: string;
    name: string;
    avgTime: string;
    compliance: string;
    days: string;
  };
}
