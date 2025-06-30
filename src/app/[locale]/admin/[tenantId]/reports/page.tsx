'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, Download, FileJson, FileSpreadsheet, FileText, Filter } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types
type WorkflowType = {
  id: number;
  name: string;
};

type WorkflowState = {
  id: number;
  name: string;
  value: number;
  color: string;
};

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

type MonthlyData = {
  name: string;
  solicitudes?: number;
  [key: string]: number | string | undefined;
};

type AreaData = {
  name: string;
  value: number;
};

type ResponseTimeData = {
  name: string;
  tiempo: number;
};

type SLACompliance = {
  name: string;
  cumplimiento: number;
};

type ProcessEfficiency = {
  name: string;
  eficiencia: number;
  volumen: number;
};

// Simulación de API para obtener flujos de trabajo y estados
const getWorkflowTypes = (): WorkflowType[] => {
  return [
    { id: 1, name: 'Activaciones' },
    { id: 2, name: 'Comisiones' },
    { id: 3, name: 'Soporte' },
    { id: 4, name: 'Facturación' },
    { id: 5, name: 'Otros' },
  ];
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

// Datos de ejemplo para los modelos de solicitud
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

// Datos de ejemplo para los gráficos
const generateMonthlyData = (selectedWorkflows: string[]): MonthlyData[] => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  if (selectedWorkflows.length === 0) {
    return months.map((month) => ({
      name: month,
      solicitudes: Math.floor(Math.random() * 50) + 30,
    }));
  }

  return months.map((month) => {
    const result: MonthlyData = { name: month };
    selectedWorkflows.forEach((workflow) => {
      result[workflow] = Math.floor(Math.random() * 40) + 10;
    });
    return result;
  });
};

const generateAreaData = (selectedWorkflows: string[]): AreaData[] => {
  if (selectedWorkflows.length === 0) {
    return getWorkflowTypes().map((type) => ({
      name: type.name,
      value: Math.floor(Math.random() * 30) + 5,
    }));
  }

  return getWorkflowTypes()
    .filter((type) => selectedWorkflows.includes(type.name))
    .map((type) => ({
      name: type.name,
      value: Math.floor(Math.random() * 30) + 5,
    }));
};

const generateResponseTimeData = (selectedWorkflows: string[]): ResponseTimeData[] => {
  if (selectedWorkflows.length === 0) {
    return getWorkflowTypes().map((type) => ({
      name: type.name,
      tiempo: Number.parseFloat((Math.random() * 3 + 1).toFixed(1)),
    }));
  }

  return getWorkflowTypes()
    .filter((type) => selectedWorkflows.includes(type.name))
    .map((type) => ({
      name: type.name,
      tiempo: Number.parseFloat((Math.random() * 3 + 1).toFixed(1)),
    }));
};

// Datos para el gráfico de cumplimiento de SLA
const slaComplianceData: SLACompliance[] = [
  { name: 'Ene', cumplimiento: 92 },
  { name: 'Feb', cumplimiento: 94 },
  { name: 'Mar', cumplimiento: 91 },
  { name: 'Abr', cumplimiento: 95 },
  { name: 'May', cumplimiento: 93 },
  { name: 'Jun', cumplimiento: 96 },
];

// Datos para el gráfico de eficiencia de procesos
const processEfficiencyData: ProcessEfficiency[] = [
  { name: 'Activaciones', eficiencia: 87, volumen: 120 },
  { name: 'Comisiones', eficiencia: 75, volumen: 80 },
  { name: 'Soporte', eficiencia: 92, volumen: 150 },
  { name: 'Facturación', eficiencia: 83, volumen: 100 },
  { name: 'Otros', eficiencia: 79, volumen: 60 },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<string>('year');
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<RequestModel | undefined>(undefined);
  const [selectedTab, setSelectedTab] = useState<string>('overview');

  const workflowTypes = getWorkflowTypes();
  const statusData = getWorkflowStates();
  const monthlyData = generateMonthlyData(selectedWorkflows);
  const areaData = generateAreaData(selectedWorkflows);
  const responseTimeData = generateResponseTimeData(selectedWorkflows);

  const handleWorkflowToggle = (workflow: string) => {
    setSelectedWorkflows((prev) => (prev.includes(workflow) ? prev.filter((w) => w !== workflow) : [...prev, workflow]));
  };

  const handleExport = (format: string) => {
    // Simulación de exportación
    toast.warning('Exportando reporte', {
      description: `El reporte se está exportando en formato ${format}`,
    });

    // En una implementación real, aquí se generaría y descargaría el archivo
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

  return (
    <div className="container py-6">
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
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <Input type="date" className="w-[150px]" />
              <Input type="date" className="w-[150px]" />
            </div>
          )}
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
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Personaliza los datos mostrados en los reportes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h3 className="mb-2 font-medium">Flujos de trabajo</h3>
                <div className="space-y-2">
                  {workflowTypes.map((workflow) => (
                    <div key={workflow.id} className="flex items-center space-x-2">
                      <Checkbox id={`workflow-${workflow.id}`} checked={selectedWorkflows.includes(workflow.name)} onCheckedChange={() => handleWorkflowToggle(workflow.name)} />
                      <Label htmlFor={`workflow-${workflow.id}`}>{workflow.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Estados</h3>
                <div className="space-y-2">
                  {statusData.map((status) => (
                    <div key={status.id} className="flex items-center space-x-2">
                      <Checkbox id={`status-${status.id}`} />
                      <Label htmlFor={`status-${status.id}`}>
                        <div className="flex items-center">
                          {status.name}
                          <span className="ml-2 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: status.color }}></span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Otros filtros</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="filter-priority" />
                    <Label htmlFor="filter-priority">Prioridad alta</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="filter-overdue" />
                    <Label htmlFor="filter-overdue">Vencidas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="filter-assigned" />
                    <Label htmlFor="filter-assigned">Asignadas a mí</Label>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedWorkflows([])}>
                Limpiar filtros
              </Button>
              <Button>Aplicar filtros</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="areas">Por Departamento</TabsTrigger>
            <TabsTrigger value="status">Por Estado</TabsTrigger>
            <TabsTrigger value="performance">Desempeño</TabsTrigger>
            <TabsTrigger value="workflows">Flujos de Trabajo</TabsTrigger>
            <TabsTrigger value="execution">Ejecución de Modelos</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Solicitudes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,248</div>
                  <p className="text-xs text-muted-foreground">+12.5% respecto al período anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tiempo Promedio de Resolución</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4 días</div>
                  <p className="text-xs text-muted-foreground">-0.3 días respecto al período anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Resolución</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground">+2.1% respecto al período anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">72</div>
                  <p className="text-xs text-muted-foreground">-5 respecto al período anterior</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Solicitudes por Mes</CardTitle>
                  <CardDescription>Evolución de solicitudes durante el último año</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {selectedWorkflows.length > 0 ? (
                          selectedWorkflows.map((workflow, index) => {
                            const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
                            return <Line key={workflow} type="monotone" dataKey={workflow} name={workflow} stroke={colors[index % colors.length]} strokeWidth={2} />;
                          })
                        ) : (
                          <Line type="monotone" dataKey="solicitudes" stroke="#ef4444" strokeWidth={2} />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Distribución por Departamento</CardTitle>
                  <CardDescription>Porcentaje de solicitudes por área</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={areaData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                          {areaData.map((entry, index) => {
                            const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Cumplimiento de SLA</CardTitle>
                  <CardDescription>Porcentaje de solicitudes resueltas dentro del tiempo acordado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={slaComplianceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[80, 100]} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="cumplimiento" name="% Cumplimiento" stroke="#8884d8" fill="#8884d8" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Eficiencia de Procesos</CardTitle>
                  <CardDescription>Relación entre eficiencia y volumen de solicitudes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="eficiencia" name="Eficiencia (%)" domain={[70, 100]} />
                        <YAxis type="number" dataKey="volumen" name="Volumen" />
                        <ZAxis range={[100, 500]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter name="Departamentos" data={processEfficiencyData} fill="#8884d8" shape="circle" label={({ name }) => name} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="areas">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes por Departamento</CardTitle>
                <CardDescription>Análisis detallado por área</CardDescription>
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
                      <Bar dataKey="tiempo" name="Tiempo promedio (días)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes por Estado</CardTitle>
                <CardDescription>Distribución actual de solicitudes según su estado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" outerRadius={150} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Tiempo de Respuesta por Departamento</CardTitle>
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
          </TabsContent>
          <TabsContent value="workflows">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Flujos de Trabajo</CardTitle>
                <CardDescription>Tiempo promedio en cada estado del flujo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getWorkflowStates()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Solicitudes" radius={[4, 4, 0, 0]}>
                          {getWorkflowStates().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={getWorkflowStates()} cx="50%" cy="50%" outerRadius={150} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                          {getWorkflowStates().map((entry, index) => (
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
          </TabsContent>
          <TabsContent value="execution">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Modelos de Solicitud</CardTitle>
                  <CardDescription>Seleccione un modelo para ver detalles</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={handleModelSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar modelo de solicitud" />
                    </SelectTrigger>
                    <SelectContent>
                      {requestModels.map((model) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="mt-4 space-y-4">
                    {requestModels.map((model) => (
                      <div
                        key={model.id}
                        className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted ${selectedModel?.id === model.id ? 'border-primary bg-muted/50' : ''}`}
                        onClick={() => handleModelSelect(model.id.toString())}>
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{model.name}</h3>
                          <Badge>{model.area}</Badge>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Tiempo promedio: {model.avgCompletionTime} días</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Tasa de éxito: {model.successRate}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedModel ? (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedModel.name}</CardTitle>
                        <CardDescription>
                          Departamento: {selectedModel.area} | Flujo: {selectedModel.workflow}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="px-3 py-1">
                        {selectedModel.successRate}% de éxito
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="steps">
                      <TabsList className="mb-4">
                        <TabsTrigger value="steps">Pasos del Proceso</TabsTrigger>
                        <TabsTrigger value="documents">Documentos Requeridos</TabsTrigger>
                        <TabsTrigger value="metrics">Métricas de Ejecución</TabsTrigger>
                      </TabsList>
                      <TabsContent value="steps">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">Pasos del proceso estandarizado</h3>
                            <span className="text-sm text-muted-foreground">Tiempo total: {selectedModel.avgCompletionTime} días</span>
                          </div>

                          <div className="space-y-4">
                            {selectedModel.steps.map((step, index) => (
                              <div key={index} className="rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">{index + 1}</div>
                                    <h4 className="font-medium">{step.name}</h4>
                                  </div>
                                  <Badge variant="outline">{step.avgTime} días</Badge>
                                </div>
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Cumplimiento del proceso:</span>
                                    <span>{step.compliance}%</span>
                                  </div>
                                  <Progress value={step.compliance} className="mt-1" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="documents">
                        <div className="space-y-4">
                          <h3 className="font-medium">Documentos de referencia</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nombre del documento</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Requerido</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedModel.documents.map((doc, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{doc.name}</TableCell>
                                  <TableCell>{doc.type}</TableCell>
                                  <TableCell>{doc.required ? <Badge variant="default">Obligatorio</Badge> : <Badge variant="outline">Opcional</Badge>}</TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                      Ver plantilla
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                      <TabsContent value="metrics">
                        <div className="space-y-6">
                          <div>
                            <h3 className="mb-2 font-medium">Ejecución mensual</h3>
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={selectedModel.monthlyExecution}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="month" />
                                  <YAxis yAxisId="left" />
                                  <YAxis yAxisId="right" orientation="right" domain={[80, 100]} />
                                  <Tooltip />
                                  <Legend />
                                  <Line yAxisId="left" type="monotone" dataKey="count" name="Cantidad" stroke="#8884d8" activeDot={{ r: 8 }} />
                                  <Line yAxisId="right" type="monotone" dataKey="compliance" name="Cumplimiento %" stroke="#82ca9d" />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Tiempo promedio</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{selectedModel.avgCompletionTime} días</div>
                                <p className="text-xs text-muted-foreground">{selectedModel.avgCompletionTime < 2.5 ? 'Por debajo del promedio' : 'Por encima del promedio'}</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Tasa de éxito</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{selectedModel.successRate}%</div>
                                <p className="text-xs text-muted-foreground">{selectedModel.successRate > 90 ? 'Excelente rendimiento' : 'Necesita mejoras'}</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Documentos requeridos</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{selectedModel.documentCount}</div>
                                <p className="text-xs text-muted-foreground">{selectedModel.documentCount < 3 ? 'Proceso simplificado' : 'Proceso complejo'}</p>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Ver historial de ejecuciones</Button>
                    <Button asChild>
                      <Link href={`/settings/workflow-editor?id=${selectedModel.id}`}>
                        Editar modelo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="flex items-center justify-center md:col-span-2">
                  <CardContent className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium">Seleccione un modelo de solicitud</h3>
                    <p className="text-sm text-muted-foreground">Elija un modelo de la lista para ver sus detalles de ejecución</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Alertas por Estado</CardTitle>
                <CardDescription>Solicitudes que requieren atención inmediata</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center">
                      <Badge className="bg-red-500">Crítico</Badge>
                      <h3 className="ml-2 font-medium">5 solicitudes en &quot;En revisión&quot; por más de 7 días</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Estas solicitudes han excedido el tiempo máximo recomendado en este estado.</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Ver solicitudes
                    </Button>
                  </div>

                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center">
                      <Badge className="bg-amber-500">Advertencia</Badge>
                      <h3 className="ml-2 font-medium">12 solicitudes en &quot;En progreso&quot; por más de 3 días</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Estas solicitudes están cerca de exceder el tiempo máximo recomendado en este estado.</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Ver solicitudes
                    </Button>
                  </div>

                  <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center">
                      <Badge className="bg-blue-500">Información</Badge>
                      <h3 className="ml-2 font-medium">3 solicitudes requieren aprobación para cambio de estado</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Estas solicitudes están esperando tu aprobación para avanzar al siguiente estado.</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Ver solicitudes
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="mb-4 font-medium">Configuración de alertas</h3>
                  <div className="space-y-4">
                    {getWorkflowStates().map((state) => (
                      <div key={state.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center">
                          <span className="mr-2 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: state.color }}></span>
                          <span>{state.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Alertar después de</span>
                          <Input type="number" className="w-16" defaultValue={state.name === 'En revisión' ? '7' : state.name === 'En progreso' ? '3' : '5'} />
                          <span className="text-sm text-muted-foreground">días</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-4">Guardar configuración</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
