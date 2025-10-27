'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getAlerts,
  getAreaDistribution,
  getAreas,
  getAverageResolutionTime,
  getMonthlyTrends,
  getOverviewReport,
  getPriorities,
  getSLACompliance,
  getStatusDistribution,
  getStatuses,
  getWorkflowDistribution,
} from '@/actions/report';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import { ArrowRight, BarChart2, CheckCircle2, Clock, Download, FileJson, FileSpreadsheet, FileText, Filter, TrendingUp } from 'lucide-react';
import { AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreasTab } from '@/components/common/reports/areas-tab';
import { ExecutionTab } from '@/components/common/reports/execution-tab';
import { OverviewTab } from '@/components/common/reports/overview-tab';
// Report components
import { ReportFilters } from '@/components/common/reports/report-filters';
import { StatusTab } from '@/components/common/reports/status-tab';
import type { Area, AreaDistribution, MonthlyTrend, OverviewData, Priority, ReportFilters as ReportFiltersType, SLACompliance, Status, StatusDistribution } from '@/components/common/reports/types';
import EmptyState from '@/components/shared/empty-state';

// Mock types for not-yet-implemented tabs
type Step = {
  name: string;
  avgTime: number;
  compliance: number;
};

type Document = {
  name: string;
  type: string;
  required: boolean;
};

type MonthlyExecution = {
  month: string;
  count: number;
  compliance: number;
};

type RequestModel = {
  id: number;
  name: string;
  area: string;
  workflow: string;
  avgCompletionTime: number;
  successRate: number;
  documentCount: number;
  steps: Step[];
  documents: Document[];
  monthlyExecution: MonthlyExecution[];
};

type WorkflowState = {
  id: number;
  name: string;
  value: number;
  color: string;
};

const getWorkflowStates = (): WorkflowState[] => {
  return [
    { id: 1, name: 'Cerrado', value: 45, color: '#10b981' },
    { id: 2, name: 'En progreso', value: 30, color: '#3b82f6' },
    { id: 3, name: 'En revisión', value: 15, color: '#f59e0b' },
    { id: 4, name: 'Borrador', value: 5, color: '#6b7280' },
    { id: 5, name: 'Cancelado', value: 5, color: '#ef4444' },
  ];
};

const requestModels: RequestModel[] = [
  {
    id: 1,
    name: 'Activación de servicio móvil',
    area: 'Activaciones',
    workflow: 'Flujo estándar',
    avgCompletionTime: 2.3,
    successRate: 94,
    documentCount: 3,
    steps: [
      { name: 'Recepción', avgTime: 0.2, compliance: 98 },
      { name: 'Validación', avgTime: 0.5, compliance: 95 },
      { name: 'Procesamiento', avgTime: 1.1, compliance: 92 },
      { name: 'Activación', avgTime: 0.3, compliance: 97 },
      { name: 'Cierre', avgTime: 0.2, compliance: 99 },
    ],
    documents: [
      { name: 'Formulario de activación', type: 'PDF', required: true },
      { name: 'Identificación del cliente', type: 'Imagen', required: true },
      { name: 'Contrato firmado', type: 'PDF', required: true },
    ],
    monthlyExecution: [
      { month: 'Ene', count: 42, compliance: 92 },
      { month: 'Feb', count: 38, compliance: 94 },
      { month: 'Mar', count: 45, compliance: 91 },
      { month: 'Abr', count: 50, compliance: 93 },
      { month: 'May', count: 48, compliance: 95 },
      { month: 'Jun', count: 52, compliance: 96 },
    ],
  },
  {
    id: 2,
    name: 'Reclamo de comisión',
    area: 'Comisiones',
    workflow: 'Flujo de comisiones',
    avgCompletionTime: 3.5,
    successRate: 88,
    documentCount: 2,
    steps: [
      { name: 'Recepción', avgTime: 0.3, compliance: 97 },
      { name: 'Validación', avgTime: 1.2, compliance: 85 },
      { name: 'Análisis', avgTime: 1.5, compliance: 82 },
      { name: 'Resolución', avgTime: 0.5, compliance: 90 },
    ],
    documents: [
      { name: 'Formulario de reclamo', type: 'PDF', required: true },
      { name: 'Comprobante de venta', type: 'PDF', required: true },
    ],
    monthlyExecution: [
      { month: 'Ene', count: 25, compliance: 85 },
      { month: 'Feb', count: 30, compliance: 87 },
      { month: 'Mar', count: 28, compliance: 86 },
      { month: 'Abr', count: 32, compliance: 88 },
      { month: 'May', count: 35, compliance: 90 },
      { month: 'Jun', count: 30, compliance: 89 },
    ],
  },
  {
    id: 3,
    name: 'Soporte técnico',
    area: 'Soporte',
    workflow: 'Flujo estándar',
    avgCompletionTime: 1.8,
    successRate: 92,
    documentCount: 1,
    steps: [
      { name: 'Recepción', avgTime: 0.2, compliance: 99 },
      { name: 'Diagnóstico', avgTime: 0.6, compliance: 90 },
      { name: 'Resolución', avgTime: 0.8, compliance: 88 },
      { name: 'Verificación', avgTime: 0.2, compliance: 95 },
    ],
    documents: [{ name: 'Reporte de problema', type: 'PDF', required: true }],
    monthlyExecution: [
      { month: 'Ene', count: 65, compliance: 90 },
      { month: 'Feb', count: 70, compliance: 91 },
      { month: 'Mar', count: 75, compliance: 92 },
      { month: 'Abr', count: 80, compliance: 93 },
      { month: 'May', count: 85, compliance: 94 },
      { month: 'Jun', count: 90, compliance: 95 },
    ],
  },
];

interface ReportsPageProps {
  params: Promise<{
    locale: string;
    tenantId: string;
  }>;
}

export default function ReportsPage({ params }: ReportsPageProps) {
  const [tenantId, setTenantId] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('year');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [selectedModel, setSelectedModel] = useState<RequestModel | undefined>(undefined);

  // Real data states
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [areaDistribution, setAreaDistribution] = useState<AreaDistribution[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [slaCompliance, setSlaCompliance] = useState<SLACompliance[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<{ name: string; tiempo: number }[]>([]);
  const [workflowData, setWorkflowData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [alertsData, setAlertsData] = useState<{ type: string; count: number; statusName: string; alerts: any[] }[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize params
  useEffect(() => {
    async function initParams() {
      const resolvedParams = await params;
      setTenantId(resolvedParams.tenantId);
    }
    initParams();
  }, [params]);

  // Load filter options
  useEffect(() => {
    if (!tenantId) return;

    async function loadFilterOptions() {
      try {
        const [areasData, statusesData, prioritiesData] = await Promise.all([getAreas(tenantId), getStatuses(tenantId), getPriorities(tenantId)]);
        setAreas(areasData);
        setStatuses(statusesData);
        setPriorities(prioritiesData);
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    }

    loadFilterOptions();
  }, [tenantId]);

  // Load overview data
  useEffect(() => {
    if (!tenantId) return;

    async function loadData() {
      try {
        setLoading(true);

        const filters = buildFilters();

        const [overview, trends, areas, statuses, compliance, responseTime, workflows, alerts] = await Promise.all([
          getOverviewReport(tenantId, filters),
          getMonthlyTrends(tenantId, filters),
          getAreaDistribution(tenantId, filters),
          getStatusDistribution(tenantId, filters),
          getSLACompliance(tenantId, filters),
          getAverageResolutionTime(tenantId, filters),
          getWorkflowDistribution(tenantId, filters),
          getAlerts(tenantId, filters),
        ]);

        setOverviewData(overview);
        setMonthlyTrends(trends);
        setAreaDistribution(areas);
        setStatusDistribution(statuses);
        setSlaCompliance(compliance);
        setResponseTimeData(responseTime);
        setWorkflowData(workflows);
        setAlertsData(alerts);
      } catch (error) {
        console.error('Error loading report data:', error);
        toast.error('Error al cargar los reportes');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [tenantId, dateRange, selectedAreas, selectedStatuses, selectedPriorities]);

  function buildFilters(): ReportFiltersType {
    const filters: ReportFiltersType = {};

    // Date range filter
    if (dateRange === 'month') {
      filters.dateRange = {
        from: startOfDay(subDays(new Date(), 30)),
        to: endOfDay(new Date()),
      };
    } else if (dateRange === 'quarter') {
      filters.dateRange = {
        from: startOfDay(subDays(new Date(), 90)),
        to: endOfDay(new Date()),
      };
    } else if (dateRange === 'year') {
      filters.dateRange = {
        from: startOfDay(subDays(new Date(), 365)),
        to: endOfDay(new Date()),
      };
    }

    // Area filter
    if (selectedAreas.length > 0) {
      filters.areas = selectedAreas;
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      filters.statuses = selectedStatuses;
    }

    // Priority filter
    if (selectedPriorities.length > 0) {
      filters.priorities = selectedPriorities;
    }

    return filters;
  }

  const handleAreaToggle = (areaId: string) => {
    setSelectedAreas((prev) => (prev.includes(areaId) ? prev.filter((a) => a !== areaId) : [...prev, areaId]));
  };

  const handleStatusToggle = (statusId: string) => {
    setSelectedStatuses((prev) => (prev.includes(statusId) ? prev.filter((s) => s !== statusId) : [...prev, statusId]));
  };

  const handlePriorityToggle = (priorityId: string) => {
    setSelectedPriorities((prev) => (prev.includes(priorityId) ? prev.filter((p) => p !== priorityId) : [...prev, priorityId]));
  };

  const handleExport = (format: string) => {
    toast.warning('Exportando reporte', {
      description: `El reporte se está exportando en formato ${format}`,
    });

    setTimeout(() => {
      toast.success('Reporte exportado', {
        description: `El reporte ha sido exportado exitosamente en formato ${format}`,
      });
    }, 2000);
  };

  const handleModelSelect = (modelId: string) => {
    const model = requestModels.find((m) => m.id === Number.parseInt(modelId));
    setSelectedModel(model);
  };

  const clearFilters = () => {
    setSelectedAreas([]);
    setSelectedStatuses([]);
    setSelectedPriorities([]);
  };

  return (
    <ScrollArea className="flex-grow min-h-0">
      <div className="container py-6 flex flex-col h-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
            <p className="text-muted-foreground">Análisis y estadísticas de solicitudes de servicios</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </Button>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Formato de exportación</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('PDF')}>
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('Excel')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('JSON')}>
                  <FileJson className="mr-2 h-4 w-4" />
                  JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {showFilters && (
          <ReportFilters
            areas={areas}
            statuses={statuses}
            priorities={priorities}
            selectedAreas={selectedAreas}
            selectedStatuses={selectedStatuses}
            selectedPriorities={selectedPriorities}
            onAreaToggle={handleAreaToggle}
            onStatusToggle={handleStatusToggle}
            onPriorityToggle={handlePriorityToggle}
            onClearFilters={clearFilters}
          />
        )}

        <div className="mt-8 flex flex-col flex-grow min-h-0">
          <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="flex flex-col flex-grow min-h-0">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="areas">Por Area</TabsTrigger>
              <TabsTrigger value="status">Por Estado</TabsTrigger>
              <TabsTrigger value="performance">Desempeño</TabsTrigger>
              <TabsTrigger value="workflows">Flujos de Trabajo</TabsTrigger>
              <TabsTrigger value="execution">Ejecución de Modelos</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="h-full overflow-y-auto">
              <OverviewTab
                overviewData={overviewData}
                monthlyTrends={monthlyTrends}
                areaDistribution={areaDistribution}
                statusDistribution={statusDistribution}
                slaCompliance={slaCompliance}
                loading={loading}
              />
            </TabsContent>
            <TabsContent value="areas" className="h-full overflow-y-auto">
              <AreasTab areaDistribution={areaDistribution} loading={loading} />
            </TabsContent>
            <TabsContent value="status" className="h-full overflow-y-auto">
              <StatusTab statusDistribution={statusDistribution} loading={loading} />
            </TabsContent>
            <TabsContent value="performance" className="h-full overflow-y-auto">
              {loading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] flex flex-col gap-4 justify-center items-center">
                      <div className="w-full flex items-end justify-around gap-2">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <Skeleton className="w-full" style={{ height: `${Math.random() * 100 + 100}px` }} />
                          </div>
                        ))}
                      </div>
                      <div className="w-full flex justify-around">
                        {[...Array(6)].map((_, i) => (
                          <Skeleton key={i} className="h-3 w-16" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : responseTimeData.length === 0 ? (
                <EmptyState
                  title="No hay datos de desempeño disponibles"
                  description="Aún no se han registrado datos de tiempo de resolución.\nLos datos aparecerán aquí una vez que haya solicitudes completadas."
                  icons={[Clock, BarChart2, TrendingUp]}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Tiempo de Respuesta por Area</CardTitle>
                    <CardDescription>Tiempo promedio de resolución en días</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={responseTimeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="tiempo" name="Tiempo (días)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="workflows" className="h-full overflow-y-auto">
              {loading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="h-[400px] flex flex-col gap-4 justify-center items-center">
                        <div className="w-full flex items-end justify-around gap-2">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                              <Skeleton className="w-full" style={{ height: `${Math.random() * 100 + 100}px` }} />
                            </div>
                          ))}
                        </div>
                        <div className="w-full flex justify-around">
                          {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-3 w-16" />
                          ))}
                        </div>
                      </div>
                      <div className="h-[400px] flex items-center justify-center">
                        <div className="w-64 h-64 rounded-full border-4 border-muted flex items-center justify-center">
                          <Skeleton className="h-32 w-32 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : workflowData.length === 0 ? (
                <EmptyState
                  title="No hay datos de flujos de trabajo disponibles"
                  description="Aún no se han registrado datos de workflows.\nLos datos aparecerán aquí una vez que haya solicitudes."
                  icons={[FileText, BarChart2, TrendingUp]}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Análisis de Flujos de Trabajo</CardTitle>
                    <CardDescription>Tiempo promedio en cada estado del flujo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={workflowData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" name="Solicitudes" radius={[4, 4, 0, 0]}>
                              {workflowData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={workflowData} cx="50%" cy="50%" outerRadius={150} dataKey="value" label={({ name, percent }) => `${name} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`}>
                              {workflowData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="execution" className="h-full overflow-y-auto">
              <ExecutionTab tenantId={tenantId} loading={loading} />
            </TabsContent>
            <TabsContent value="alerts" className="h-full overflow-y-auto">
              {loading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-md" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : alertsData.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Alertas por Estado</CardTitle>
                    <CardDescription>Solicitudes que requieren atención inmediata</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center py-12">
                      <EmptyState
                        title="No hay alertas activas"
                        description="Todas las solicitudes están en orden.\nNo se encontraron alertas de SLA vencido o en riesgo."
                        icons={[CheckCircle2, Clock, TrendingUp]}
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Alertas por Estado</CardTitle>
                    <CardDescription>Solicitudes que requieren atención inmediata</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {alertsData.map((alertGroup, index) => {
                        const badgeColor = alertGroup.type === 'critical' ? 'bg-red-500' : alertGroup.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500';
                        const borderColor = alertGroup.type === 'critical' ? 'border-red-200' : alertGroup.type === 'warning' ? 'border-amber-200' : 'border-blue-200';
                        const bgColor = alertGroup.type === 'critical' ? 'bg-red-50' : alertGroup.type === 'warning' ? 'bg-amber-50' : 'bg-blue-50';
                        const title = alertGroup.type === 'critical' ? 'Crítico' : alertGroup.type === 'warning' ? 'Advertencia' : 'Información';
                        const description =
                          alertGroup.type === 'critical' ? 'Estas solicitudes han vencido su SLA y requieren atención inmediata.' : 'Estas solicitudes están en riesgo de vencer su SLA.';

                        return (
                          <div key={index} className={`rounded-md border ${borderColor} ${bgColor} p-4`}>
                            <div className="flex items-center">
                              <Badge className={badgeColor}>{title}</Badge>
                              <h3 className="ml-2 font-medium">
                                {alertGroup.count} solicitud{alertGroup.count !== 1 ? 'es' : ''} en &quot;{alertGroup.statusName}&quot; con SLA{' '}
                                {alertGroup.type === 'critical' ? 'vencido' : 'en riesgo'}
                              </h3>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              Ver solicitudes
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ScrollArea>
  );
}
