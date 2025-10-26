'use client';

import type React from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle, Clock, FileText, Target, XCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    text?: string;
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
            <span className={trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}>{Math.abs(trend.value).toFixed(1)}%</span>
            {trend.text && <span className="ml-1 text-muted-foreground">{trend.text}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricsData {
  totalRequests: { value: number; trend: { value: number; isPositive: boolean } };
  draftRequests: { value: number; trend: { value: number; isPositive: boolean } };
  avgResolutionTime: number;
  resolutionRate: { value: number; trend: { value: number; isPositive: boolean } };
  pendingRequests: { value: number; trend: { value: number; isPositive: boolean }; highPriority?: number };
  completedRequests: { value: number; avgResolutionTime: number };
  slaOverdue: { value: number; trend: { value: number; isPositive: boolean } };
  slaCompliance: { value: number; trend: { value: number; isPositive: boolean } };
  slaAtRisk: { value: number; trend: { value: number; isPositive: boolean } };
}

// Métricas generales del sistema (independientes del workflow)
export function GeneralMetrics({ data }: { data: MetricsData }) {
  const generalMetrics = [
    {
      id: 'total',
      title: 'Total de Solicitudes',
      value: data.totalRequests.value.toLocaleString(),
      trend: { value: data.totalRequests.trend.value, isPositive: data.totalRequests.trend.isPositive, text: 'vs. mes anterior' },
      icon: <FileText className="h-4 w-4" />,
      iconColor: 'text-blue-500',
    },
    {
      id: 'avg-resolution',
      title: 'Tiempo Promedio de Resolución',
      value: data.avgResolutionTime > 0 ? `${data.avgResolutionTime.toFixed(1)} días` : 'N/A',
      trend: { value: 8.1, isPositive: true, text: 'últimos 30 días' },
      icon: <Clock className="h-4 w-4" />,
      iconColor: 'text-indigo-500',
    },
    {
      id: 'resolution-rate',
      title: 'Tasa de Resolución',
      value: `${data.resolutionRate.value.toFixed(1)}%`,
      trend: { ...data.resolutionRate.trend, text: 'vs. mes anterior' },
      icon: <CheckCircle className="h-4 w-4" />,
      iconColor: 'text-emerald-500',
    },
    {
      id: 'pending',
      title: 'Solicitudes Pendientes',
      value: data.pendingRequests.value.toString(),
      trend: { ...data.pendingRequests.trend, text: 'vs. mes anterior' },
      icon: <AlertTriangle className="h-4 w-4" />,
      iconColor: 'text-amber-500',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Métricas Generales</h3>
        <div className="h-px bg-border flex-1 ml-4" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {generalMetrics.map((metric) => (
          <MetricCard key={metric.id} title={metric.title} value={metric.value} trend={metric.trend} icon={metric.icon} iconColor={metric.iconColor} />
        ))}
      </div>
    </div>
  );
}

// Métricas de SLA (independientes del workflow)
export function SLAMetrics({ data }: { data: MetricsData }) {
  const slaMetrics = [
    {
      id: 'sla-overdue',
      title: 'Solicitudes Vencidas (SLA)',
      value: data.slaOverdue.value.toString(),
      trend: { value: data.slaOverdue.trend.value, isPositive: data.slaOverdue.trend.isPositive, text: 'vs. mes anterior' },
      icon: <AlertTriangle className="h-4 w-4" />,
      iconColor: 'text-red-500',
    },
    {
      id: 'sla-compliance',
      title: 'SLA Promedio Cumplido',
      value: `${data.slaCompliance.value.toFixed(0)}%`,
      trend: { ...data.slaCompliance.trend, text: 'vs. mes anterior' },
      icon: <Target className="h-4 w-4" />,
      iconColor: 'text-blue-500',
    },
    {
      id: 'sla-warning',
      title: 'SLA en Riesgo',
      value: data.slaAtRisk.value.toString(),
      trend: { value: data.slaAtRisk.trend.value, isPositive: data.slaAtRisk.trend.isPositive, text: 'vs. mes anterior' },
      icon: <Clock className="h-4 w-4" />,
      iconColor: 'text-amber-500',
    },
    {
      id: 'draft',
      title: 'Solicitudes en Borrador',
      value: data.draftRequests.value.toString(),
      trend: { value: data.draftRequests.trend.value, isPositive: data.draftRequests.trend.isPositive, text: 'vs. mes anterior' },
      icon: <XCircle className="h-4 w-4" />,
      iconColor: 'text-gray-500',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Métricas de SLA y Estados Fijos</h3>
        <div className="h-px bg-border flex-1 ml-4" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {slaMetrics.map((metric) => (
          <MetricCard key={metric.id} title={metric.title} value={metric.value} trend={metric.trend} icon={metric.icon} iconColor={metric.iconColor} />
        ))}
      </div>
    </div>
  );
}

// Componente principal que combina todas las métricas
export function DashboardMetrics({ data }: { data: MetricsData }) {
  return (
    <div className="space-y-8">
      <GeneralMetrics data={data} />
      <SLAMetrics data={data} />
    </div>
  );
}

// Export para compatibilidad
export default DashboardMetrics;
