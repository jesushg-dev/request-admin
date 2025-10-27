// Shared types for reports

export interface ReportFilters {
  dateRange?: {
    from: Date;
    to: Date;
  };
  areas?: string[];
  statuses?: string[];
  priorities?: string[];
}

export interface OverviewData {
  totalRequests: number;
  openRequests: number;
  closedRequests: number;
  overdueRequests: number;
  avgResolutionTime: number;
}

export interface MonthlyTrend {
  month: string;
  count: number;
}

export interface AreaDistribution {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export interface SLACompliance {
  name: string;
  cumplimiento: number;
}

export interface Area {
  id: string;
  name: string;
}

export interface Status {
  id: string;
  name: string;
  color: string;
  type?: string;
}

export interface Priority {
  id: string;
  name: string;
}
