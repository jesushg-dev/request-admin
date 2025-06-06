export interface GeneralMetric {
  id: string;
  title: string;
  value: string | number;
  trend: {
    value: number;
    isPositive: boolean;
    text: string;
  };
  icon: string;
  iconColor: string;
}

export interface DepartmentData {
  name: string;
  value: number;
  tiempo: number;
  color?: string;
}

export interface MonthlyData {
  name: string;
  solicitudes: number;
  cumplimiento: number;
}

export interface WorkflowType {
  id: number;
  name: string;
  states: string[];
}

export interface WorkflowStateData {
  name: string;
  value: number;
  avgTime: number;
  trend: number;
}

export interface SLAMetrics {
  onTime: number;
  nearDue: number;
  overdue: number;
  avgCompliance: number;
  atRisk: number;
  escalated: number;
}

export interface SLADistribution {
  name: string;
  value: number;
  color: string;
}

export interface SLAByDepartment {
  name: string;
  cumplimiento: number;
  volumen: number;
}

export interface SearchFilters {
  searchTerm?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  requestHierarchy?: {
    canalVenta: string;
    tipoServicio: string;
  };
  assignmentHierarchy?: {
    area: string;
    tipoSolicitud: string;
    categoria: string;
    subcategoria: string;
  };
}

export interface WorkflowSelectorProps {
  selectedWorkflow: string | null;
  onWorkflowChange: (workflowId: string | null) => void;
}

export interface SLAFiltersProps {
  onSearch: (filters: Record<string, unknown>) => void;
}
