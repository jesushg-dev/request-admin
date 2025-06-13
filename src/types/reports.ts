export interface ServiceType {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface ExecutionStep {
  name: string;
  avgTime: number;
  compliance: number;
}

export interface ExecutionDocument {
  name: string;
  type: string;
  required: boolean;
}

export interface MonthlyExecution {
  month: string;
  count: number;
  compliance: number;
}

export interface ExecutionModel {
  id: number;
  name: string;
  description: string;
  department: string;
  workflow: string;
  channel: string;
  serviceType: string;
  area: string;
  category: string;
  status: 'active' | 'inactive';
  executedCount: number;
  successRate: number;
  avgCompletionTime: number;
  documentCount: number;
  lastExecution: string;
  steps: ExecutionStep[];
  documents: ExecutionDocument[];
  monthlyExecution: MonthlyExecution[];
}

export interface ReportFilters {
  dateRange: 'month' | 'quarter' | 'year' | 'custom';
  selectedWorkflow: string;
  selectedChannel: string;
  selectedServiceType: string;
  selectedArea: string;
  selectedCategory: string;
  showFilters: boolean;
}

export interface ExportFormat {
  format: 'PDF' | 'Excel' | 'JSON';
}

export interface GeneralMetricsData {
  totalRequests: number;
  avgResolutionTime: number;
  resolutionRate: number;
  pendingRequests: number;
  monthlyTrend: number;
  timeTrend: number;
  rateTrend: number;
  pendingTrend: number;
}
