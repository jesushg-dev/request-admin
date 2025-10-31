'use client';

import { useMemo } from 'react';
import type React from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle, Clock, FileText, Target, XCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

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
  avgResolutionTimeTrend?: { value: number; isPositive: boolean };
  resolutionRate: { value: number; trend: { value: number; isPositive: boolean } };
  pendingRequests: { value: number; trend: { value: number; isPositive: boolean }; highPriority?: number };
  completedRequests: { value: number; avgResolutionTime: number };
  slaOverdue: { value: number; trend: { value: number; isPositive: boolean } };
  slaCompliance: { value: number; trend: { value: number; isPositive: boolean } };
  slaAtRisk: { value: number; trend: { value: number; isPositive: boolean } };
}

// Métricas generales del sistema (independientes del workflow)
export function GeneralMetrics({ data }: { data: MetricsData }) {
  const t = useTranslations('admin.dashboard.metrics');
  const generalMetrics = useMemo(
    () => [
      {
        id: 'total',
        title: t('general.totalRequests.title'),
        value: data.totalRequests.value.toLocaleString(),
        trend: { value: data.totalRequests.trend.value, isPositive: data.totalRequests.trend.isPositive, text: t('general.vsLastMonth') },
        icon: <FileText className="h-4 w-4" />,
        iconColor: 'text-blue-500',
      },
      {
        id: 'avg-resolution',
        title: t('general.avgResolutionTime.title'),
        value: data.avgResolutionTime > 0 ? `${data.avgResolutionTime.toFixed(1)} ${t('general.avgResolutionTime.unit')}` : 'N/A',
        trend: data.avgResolutionTimeTrend ? { ...data.avgResolutionTimeTrend, text: t('general.vsLastMonth') } : undefined,
        icon: <Clock className="h-4 w-4" />,
        iconColor: 'text-indigo-500',
      },
      {
        id: 'resolution-rate',
        title: t('general.resolutionRate.title'),
        value: `${data.resolutionRate.value.toFixed(1)}%`,
        trend: { ...data.resolutionRate.trend, text: t('general.vsLastMonth') },
        icon: <CheckCircle className="h-4 w-4" />,
        iconColor: 'text-emerald-500',
      },
      {
        id: 'pending',
        title: t('general.pending.title'),
        value: data.pendingRequests.value.toString(),
        trend: { ...data.pendingRequests.trend, text: t('general.vsLastMonth') },
        icon: <AlertTriangle className="h-4 w-4" />,
        iconColor: 'text-amber-500',
      },
    ],
    [
      t,
      data.totalRequests.value,
      data.totalRequests.trend.value,
      data.totalRequests.trend.isPositive,
      data.avgResolutionTime,
      data.avgResolutionTimeTrend?.value,
      data.avgResolutionTimeTrend?.isPositive,
      data.resolutionRate.value,
      data.resolutionRate.trend.value,
      data.resolutionRate.trend.isPositive,
      data.pendingRequests.value,
      data.pendingRequests.trend.value,
      data.pendingRequests.trend.isPositive,
    ]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('general.title')}</h3>
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
  const t = useTranslations('admin.dashboard.metrics');
  const slaMetrics = useMemo(
    () => [
      {
        id: 'sla-overdue',
        title: t('sla.overdue.title'),
        value: data.slaOverdue.value.toString(),
        trend: { value: data.slaOverdue.trend.value, isPositive: data.slaOverdue.trend.isPositive, text: t('sla.vsLastMonth') },
        icon: <AlertTriangle className="h-4 w-4" />,
        iconColor: 'text-red-500',
      },
      {
        id: 'sla-compliance',
        title: t('sla.compliance.title'),
        value: `${data.slaCompliance.value.toFixed(0)}%`,
        trend: { ...data.slaCompliance.trend, text: t('sla.vsLastMonth') },
        icon: <Target className="h-4 w-4" />,
        iconColor: 'text-blue-500',
      },
      {
        id: 'sla-warning',
        title: t('sla.atRisk.title'),
        value: data.slaAtRisk.value.toString(),
        trend: { value: data.slaAtRisk.trend.value, isPositive: data.slaAtRisk.trend.isPositive, text: t('sla.vsLastMonth') },
        icon: <Clock className="h-4 w-4" />,
        iconColor: 'text-amber-500',
      },
      {
        id: 'draft',
        title: t('sla.draft.title'),
        value: data.draftRequests.value.toString(),
        trend: { value: data.draftRequests.trend.value, isPositive: data.draftRequests.trend.isPositive, text: t('sla.vsLastMonth') },
        icon: <XCircle className="h-4 w-4" />,
        iconColor: 'text-gray-500',
      },
    ],
    [
      t,
      data.slaOverdue.value,
      data.slaOverdue.trend.value,
      data.slaOverdue.trend.isPositive,
      data.slaCompliance.value,
      data.slaCompliance.trend.value,
      data.slaCompliance.trend.isPositive,
      data.slaAtRisk.value,
      data.slaAtRisk.trend.value,
      data.slaAtRisk.trend.isPositive,
      data.draftRequests.value,
      data.draftRequests.trend.value,
      data.draftRequests.trend.isPositive,
    ]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('sla.title')}</h3>
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
