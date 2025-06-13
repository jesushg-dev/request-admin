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
            <span className={trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}>{Math.abs(trend.value).toFixed(1)}%</span>
            <span className="ml-1 text-muted-foreground">{trend.text}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Métricas generales del sistema (independientes del workflow)
export function GeneralMetrics() {
  const generalMetrics = [
    {
      id: 'total',
      title: 'Total de Solicitudes',
      value: '1,248',
      trend: { value: 12.5, isPositive: true, text: 'vs. mes anterior' },
      icon: <FileText className="h-4 w-4" />,
      iconColor: 'text-blue-500',
    },
    {
      id: 'avg-resolution',
      title: 'Tiempo Promedio de Resolución',
      value: '2.4 días',
      trend: { value: 8.1, isPositive: true, text: 'más rápido' },
      icon: <Clock className="h-4 w-4" />,
      iconColor: 'text-indigo-500',
    },
    {
      id: 'resolution-rate',
      title: 'Tasa de Resolución',
      value: '94.2%',
      trend: { value: 2.1, isPositive: true, text: 'vs. mes anterior' },
      icon: <CheckCircle className="h-4 w-4" />,
      iconColor: 'text-emerald-500',
    },
    {
      id: 'pending',
      title: 'Solicitudes Pendientes',
      value: '72',
      trend: { value: 5.3, isPositive: false, text: 'vs. mes anterior' },
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
export function SLAMetrics() {
  const slaMetrics = [
    {
      id: 'sla-overdue',
      title: 'Solicitudes Vencidas (SLA)',
      value: '23',
      trend: { value: 8.2, isPositive: true, text: 'menos que el mes anterior' },
      icon: <AlertTriangle className="h-4 w-4" />,
      iconColor: 'text-red-500',
    },
    {
      id: 'sla-compliance',
      title: 'SLA Promedio Cumplido',
      value: '87%',
      trend: { value: 3.5, isPositive: true, text: 'vs. mes anterior' },
      icon: <Target className="h-4 w-4" />,
      iconColor: 'text-blue-500',
    },
    {
      id: 'sla-warning',
      title: 'SLA en Riesgo',
      value: '15',
      trend: { value: 2.1, isPositive: false, text: 'vs. mes anterior' },
      icon: <Clock className="h-4 w-4" />,
      iconColor: 'text-amber-500',
    },
    {
      id: 'draft',
      title: 'Solicitudes en Borrador',
      value: '45',
      trend: { value: 2.5, isPositive: true, text: 'vs. mes anterior' },
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
export function DashboardMetrics() {
  return (
    <div className="space-y-8">
      <GeneralMetrics />
      <SLAMetrics />
    </div>
  );
}
