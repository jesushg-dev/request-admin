'use client';

import type React from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, Calendar, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Datos para el gráfico de SLA por estado
const slaPieData = [
  { name: 'A tiempo', value: 65, color: '#3b82f6' },
  { name: 'Próximo a vencer', value: 15, color: '#f59e0b' },
  { name: 'Vencido', value: 10, color: '#ef4444' },
  { name: 'Completado', value: 10, color: '#10b981' },
];

// Datos para el gráfico de SLA por workflow
const slaWorkflowData = [
  {
    name: 'Activaciones',
    onTime: 42,
    warning: 8,
    overdue: 5,
    completed: 25,
  },
  {
    name: 'Soporte',
    onTime: 35,
    warning: 12,
    overdue: 3,
    completed: 18,
  },
  {
    name: 'Comisiones',
    onTime: 28,
    warning: 6,
    overdue: 2,
    completed: 15,
  },
  {
    name: 'Facturación',
    onTime: 22,
    warning: 4,
    overdue: 1,
    completed: 12,
  },
];

// Datos para el gráfico de tendencia de SLA
const slaTrendData = [
  { name: 'Ene', cumplimiento: 82, promedio: 85, solicitudes: 120 },
  { name: 'Feb', cumplimiento: 85, promedio: 85, solicitudes: 135 },
  { name: 'Mar', cumplimiento: 83, promedio: 85, solicitudes: 142 },
  { name: 'Abr', cumplimiento: 87, promedio: 85, solicitudes: 158 },
  { name: 'May', cumplimiento: 89, promedio: 85, solicitudes: 167 },
  { name: 'Jun', cumplimiento: 92, promedio: 85, solicitudes: 189 },
];

// Datos para análisis por hora del día
const slaHourlyData = [
  { hour: '00', violations: 2, total: 15 },
  { hour: '02', violations: 1, total: 8 },
  { hour: '04', violations: 0, total: 5 },
  { hour: '06', violations: 3, total: 12 },
  { hour: '08', violations: 8, total: 45 },
  { hour: '10', violations: 12, total: 67 },
  { hour: '12', violations: 15, total: 78 },
  { hour: '14', violations: 18, total: 82 },
  { hour: '16', violations: 14, total: 71 },
  { hour: '18', violations: 9, total: 52 },
  { hour: '20', violations: 6, total: 34 },
  { hour: '22', violations: 4, total: 23 },
];

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    text: string;
  };
  icon?: React.ReactNode;
  iconColor?: string;
}

function MetricCard({ title, value, description, trend, icon, iconColor }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className={`${iconColor || ''}`}>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <div className="mt-1 flex items-center text-xs">
            {trend.isPositive ? <ArrowUp className="mr-1 h-3 w-3 text-emerald-500" /> : <ArrowDown className="mr-1 h-3 w-3 text-rose-500" />}
            <span className={trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}>{trend.value}%</span>
            <span className="ml-1 text-muted-foreground">{trend.text}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SLADashboard() {
  return (
    <div className="space-y-6">
      {/* Métricas principales de SLA */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Cumplimiento de SLA"
          value="87.5%"
          trend={{ value: 2.5, isPositive: true, text: 'vs. mes anterior' }}
          icon={<CheckCircle className="h-4 w-4" />}
          iconColor="text-emerald-500"
        />
        <MetricCard
          title="Tiempo Promedio de Resolución"
          value="2.4 días"
          trend={{ value: 8.1, isPositive: true, text: 'más rápido' }}
          icon={<Clock className="h-4 w-4" />}
          iconColor="text-blue-500"
        />
        <MetricCard title="Solicitudes en Riesgo" value="15" trend={{ value: 3.2, isPositive: true, text: 'menos que ayer' }} icon={<AlertTriangle className="h-4 w-4" />} iconColor="text-amber-500" />
        <MetricCard title="Solicitudes Vencidas" value="10" trend={{ value: 5.3, isPositive: false, text: 'vs. mes anterior' }} icon={<AlertTriangle className="h-4 w-4" />} iconColor="text-red-500" />
      </div>

      {/* Segunda fila de métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="SLA Promedio por Solicitud" value="48h" description="Tiempo asignado promedio" icon={<Calendar className="h-4 w-4" />} iconColor="text-purple-500" />
        <MetricCard
          title="Escalaciones por SLA"
          value="7"
          trend={{ value: 12.5, isPositive: false, text: 'vs. semana anterior' }}
          icon={<TrendingUp className="h-4 w-4" />}
          iconColor="text-orange-500"
        />
        <MetricCard title="Equipos con Mejor SLA" value="Activaciones" description="94.2% de cumplimiento" icon={<Users className="h-4 w-4" />} iconColor="text-green-500" />
        <MetricCard title="Tiempo Crítico Restante" value="2.3h" description="Promedio para solicitudes en riesgo" icon={<Clock className="h-4 w-4" />} iconColor="text-red-500" />
      </div>

      {/* Gráficos principales */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado de SLA</CardTitle>
            <CardDescription>Distribución de solicitudes por estado de SLA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={slaPieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {slaPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} solicitudes`, 'Cantidad']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SLA por Workflow</CardTitle>
            <CardDescription>Distribución de estados de SLA por tipo de workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slaWorkflowData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="onTime" name="A tiempo" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="warning" name="Próximo a vencer" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="overdue" name="Vencido" stackId="a" fill="#ef4444" />
                  <Bar dataKey="completed" name="Completado" stackId="a" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendencia de cumplimiento */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Cumplimiento de SLA</CardTitle>
          <CardDescription>Porcentaje de cumplimiento y volumen de solicitudes en los últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={slaTrendData}>
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" domain={[75, 100]} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="cumplimiento" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="% Cumplimiento" />
                <Line yAxisId="left" type="monotone" dataKey="promedio" stroke="#d1d5db" strokeDasharray="5 5" name="Objetivo (85%)" />
                <Bar yAxisId="right" dataKey="solicitudes" fill="#f59e0b" fillOpacity={0.7} name="Total Solicitudes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Análisis por hora del día */}
      <Card>
        <CardHeader>
          <CardTitle>Violaciones de SLA por Hora</CardTitle>
          <CardDescription>Análisis de incumplimientos de SLA durante el día</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={slaHourlyData}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="violations" stroke="#ef4444" name="Violaciones de SLA" />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total Solicitudes" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Paneles de detalle */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>SLA por Departamento</CardTitle>
            <CardDescription>Cumplimiento de SLA por departamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">Activaciones</span>
                </div>
                <span className="text-sm font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">Soporte Técnico</span>
                </div>
                <span className="text-sm font-medium">88%</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">Comisiones</span>
                </div>
                <span className="text-sm font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">Facturación</span>
                </div>
                <span className="text-sm font-medium">79%</span>
              </div>
              <Progress value={79} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiempo Promedio de Resolución</CardTitle>
            <CardDescription>Por tipo de solicitud (en horas)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">Línea Nueva</span>
                </div>
                <span className="text-sm font-medium">18h / 24h</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">Portabilidad</span>
                </div>
                <span className="text-sm font-medium">62h / 72h</span>
              </div>
              <Progress value={86} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">Cambio de Plan</span>
                </div>
                <span className="text-sm font-medium">20h / 24h</span>
              </div>
              <Progress value={83} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">Soporte Técnico</span>
                </div>
                <span className="text-sm font-medium">7h / 8h</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas de SLA</CardTitle>
            <CardDescription>Solicitudes que requieren atención inmediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Alerta AMBER */}
              <div
                className="rounded-md border p-3 
        bg-amber-50 border-amber-200 
        dark:bg-amber-900/30 dark:border-amber-900/60">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="font-medium text-amber-800 dark:text-amber-200">REQ-2023-042</span>
                </div>
                <div className="mt-1 text-sm text-amber-700 dark:text-amber-100">
                  <p>Vence en 2 horas (90% del SLA)</p>
                  <p className="mt-1">Portabilidad - Activaciones</p>
                </div>
              </div>

              {/* Alerta AMBER */}
              <div
                className="rounded-md border p-3 
        bg-amber-50 border-amber-200 
        dark:bg-amber-900/30 dark:border-amber-900/60">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="font-medium text-amber-800 dark:text-amber-200">REQ-2023-051</span>
                </div>
                <div className="mt-1 text-sm text-amber-700 dark:text-amber-100">
                  <p>Vence en 3 horas (85% del SLA)</p>
                  <p className="mt-1">Cambio de Plan - Facturación</p>
                </div>
              </div>

              {/* Alerta RED */}
              <div
                className="rounded-md border p-3 
        bg-red-50 border-red-200 
        dark:bg-red-900/30 dark:border-red-900/60">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="font-medium text-red-800 dark:text-red-200">REQ-2023-039</span>
                </div>
                <div className="mt-1 text-sm text-red-700 dark:text-red-100">
                  <p>Vencido hace 5 horas (120% del SLA)</p>
                  <p className="mt-1">Soporte Técnico - Equipos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
