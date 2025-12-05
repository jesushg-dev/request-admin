import type React from 'react';
import { getSLADashboardData } from '@/actions/dashboard';
import { AlertTriangle, ArrowDown, ArrowUp, Calendar, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { dashboardSearchParamsCache } from '@/app/[locale]/admin/[tenantId]/dashboard-search-params';

import SLACharts from './sla-charts';
import type { SLAFilterValues } from './sla-filters';

// Types
type SLADeptData = {
  name: string;
  compliance: number;
};

type SLATimeByType = {
  name: string;
  hours: number;
  count: number;
};

type SLAAlert = {
  id: string;
  requestId: string;
  issueSubject: string;
  type: string;
  level: string;
  message: string;
  department: string;
};

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

// Components
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

interface SLADashboardServerProps {
  tenantId: string;
  locale: Locale;
}

export function SLADashboardFallback() {
  return (
    <div className="space-y-6">
      {/* Skeletons for first 4 metric cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      {/* Skeletons for next 4 metric cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      {/* Main charts skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-[300px] animate-pulse rounded-lg bg-muted" />
        <div className="h-[300px] animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export default async function SLADashboardServer({ tenantId, locale }: SLADashboardServerProps) {
  // Get filters from search params cache (already parsed in page.tsx)
  const slaStatus = dashboardSearchParamsCache.get('slaStatus');
  const slaPercentage = dashboardSearchParamsCache.get('slaPercentage');
  const slaTimeRange = dashboardSearchParamsCache.get('slaTimeRange');
  const slaWorkflowType = dashboardSearchParamsCache.get('slaWorkflowType');

  // Build filters object
  const filters: SLAFilterValues | null =
    slaStatus || slaPercentage.length > 0 || slaTimeRange || slaWorkflowType
      ? {
          slaStatus: slaStatus ?? 'all',
          slaPercentage: slaPercentage ?? [0, 100],
          slaTimeRange: slaTimeRange ?? 'all',
          workflowType: slaWorkflowType ?? 'all',
        }
      : null;

  // Fetch data on server - this is the key performance improvement
  const data = await getSLADashboardData(tenantId, filters ?? undefined);

  // Get translations on server
  const t = await getTranslations({ locale, namespace: 'admin.dashboard.slaDashboard' });

  return (
    <div className="space-y-6">
      {/* Main SLA metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('cards.compliance.title')}
          value={`${data.compliance.toFixed(1)}%`}
          trend={data.trends.complianceTrend}
          icon={<CheckCircle className="h-4 w-4" />}
          iconColor="text-emerald-500"
        />
        <MetricCard
          title={t('cards.avgResolutionTime.title')}
          value={`${data.avgResolutionTime.toFixed(1)} ${t('cards.avgResolutionTime.unit')}`}
          trend={data.trends.resolutionTimeTrend}
          icon={<Clock className="h-4 w-4" />}
          iconColor="text-blue-500"
        />
        <MetricCard title={t('cards.atRisk.title')} value={data.atRisk.toString()} trend={data.trends.atRiskTrend} icon={<AlertTriangle className="h-4 w-4" />} iconColor="text-amber-500" />
        <MetricCard title={t('cards.overdue.title')} value={data.overdue.toString()} trend={data.trends.overdueTrend} icon={<AlertTriangle className="h-4 w-4" />} iconColor="text-red-500" />
      </div>

      {/* Second row of metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('cards.avgSlaHours.title')}
          value={`${data.avgSlaHours}${t('cards.avgSlaHours.unit')}`}
          description={t('cards.avgSlaHours.description')}
          icon={<Calendar className="h-4 w-4" />}
          iconColor="text-purple-500"
        />
        <MetricCard
          title={t('cards.escalations.title')}
          value="0"
          trend={{ value: 0, isPositive: true, text: t('cards.escalations.trendText') }}
          icon={<TrendingUp className="h-4 w-4" />}
          iconColor="text-orange-500"
        />
        <MetricCard
          title={t('cards.bestWorkflow.title')}
          value={data.bestWorkflow.name}
          description={t('cards.bestWorkflow.description', { compliance: data.bestWorkflow.compliance.toFixed(1) })}
          icon={<Users className="h-4 w-4" />}
          iconColor="text-green-500"
        />
        <MetricCard
          title={t('cards.activeAlerts.title')}
          value={data.alerts.length.toString()}
          description={t('cards.activeAlerts.description')}
          icon={<AlertTriangle className="h-4 w-4" />}
          iconColor="text-red-500"
        />
      </div>

      {/* Charts - client component */}
      <SLACharts data={data} />

      {/* Detail panels */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('panels.dept.title')}</CardTitle>
            <CardDescription>{t('panels.dept.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.slaDeptData.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">{t('panels.dept.empty')}</div>
            ) : (
              data.slaDeptData.slice(0, 4).map((dept: SLADeptData) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-medium">{dept.name}</span>
                    </div>
                    <span className="text-sm font-medium">{dept.compliance.toFixed(0)}%</span>
                  </div>
                  <Progress value={dept.compliance} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('panels.avgTime.title')}</CardTitle>
            <CardDescription>{t('panels.avgTime.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.avgTimeByType.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">{t('panels.avgTime.empty')}</div>
            ) : (
              data.avgTimeByType.map((type: SLATimeByType) => {
                const percentage = Math.min((type.hours / 24) * 100, 100);
                return (
                  <div key={type.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium">{type.name}</span>
                      </div>
                      <span className="text-sm font-medium">{type.hours.toFixed(1)}h</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('panels.alerts.title')}</CardTitle>
            <CardDescription>{t('panels.alerts.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.alerts.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">{t('panels.alerts.empty')}</div>
              ) : (
                data.alerts.map((alert: SLAAlert) => (
                  <div
                    key={alert.id}
                    className={`rounded-md border p-3 ${
                      alert.level === 'danger' ? 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-900/60' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-900/60'
                    }`}>
                    <div className="flex items-center">
                      <AlertTriangle className={`h-4 w-4 mr-2 ${alert.level === 'danger' ? 'text-red-500' : 'text-amber-500'}`} />
                      <span className={`font-medium ${alert.level === 'danger' ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'}`}>{alert.requestId.slice(0, 13)}...</span>
                    </div>
                    <div className={`mt-1 text-sm ${alert.level === 'danger' ? 'text-red-700 dark:text-red-100' : 'text-amber-700 dark:text-amber-100'}`}>
                      <p>{alert.message}</p>
                      <p className="mt-1">{alert.department}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
