'use client';

import { useEffect, useState } from 'react';
import type React from 'react';
import { getSLADashboardData } from '@/actions/dashboard';
import { AlertTriangle, ArrowDown, ArrowUp, Calendar, CheckCircle, Clock, FileText, Target, TrendingUp, Users } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/empty-state';
import { useTranslations } from 'next-intl';

import type { SLAFilterValues } from './sla-filters';

interface SLADashboardProps {
  tenantId: string;
  filters?: SLAFilterValues | null;
}

interface SLADataEntry {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // Index signature
}

interface SLAWorkflowData {
  name: string;
  onTime: number;
  warning: number;
  overdue: number;
  completed: number;
}

interface SLAHourlyData {
  hour: string;
  violations: number;
  total: number;
}

interface SLADeptData {
  name: string;
  compliance: number;
}

interface SLAAlert {
  id: string;
  requestId: string;
  issueSubject: string;
  type: string;
  level: string;
  message: string;
  department: string;
}

interface SLATrendData {
  name: string;
  cumplimiento: number;
  promedio: number;
  solicitudes: number;
}

interface SLATimeByType {
  name: string;
  hours: number;
  count: number;
}

interface SLADataResponse {
  compliance: number;
  avgResolutionTime: number;
  atRisk: number;
  overdue: number;
  slaPieData: SLADataEntry[];
  slaWorkflowData: SLAWorkflowData[];
  slaHourlyChartData: SLAHourlyData[];
  slaDeptData: SLADeptData[];
  bestWorkflow: {
    name: string;
    compliance: number;
  };
  avgSlaHours: string;
  alerts: SLAAlert[];
  avgTimeByType: SLATimeByType[];
  trendData: SLATrendData[];
  trends: {
    complianceTrend: { value: number; isPositive: boolean; text: string };
    resolutionTimeTrend: { value: number; isPositive: boolean; text: string };
    atRiskTrend: { value: number; isPositive: boolean; text: string };
    overdueTrend: { value: number; isPositive: boolean; text: string };
  };
}

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
            <span className={trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}>{trend.value}%</span>
            <span className="ml-1 text-muted-foreground">{trend.text}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SLADashboardSkeleton() {
  const t = useTranslations('admin.dashboard.slaDashboard');
  return (
    <div className="space-y-6">
      {/* Skeletons for first 4 metric cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skeletons for next 4 metric cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main charts skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pie Chart Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-1" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border-4 border-muted flex items-center justify-center">
                <Skeleton className="h-20 w-20 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-1" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex flex-col justify-end gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-12 flex-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance trend skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64 mb-1" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-end justify-around gap-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <Skeleton className="w-full" style={{ height: `${Math.random() * 100 + 100}px` }} />
                <Skeleton className="h-3 w-12 mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hourly analysis skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56 mb-1" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col justify-around">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-1 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail panels skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, panelIndex) => (
          <Card key={panelIndex}>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SLADashboard({ tenantId, filters }: SLADashboardProps) {
  const t = useTranslations('admin.dashboard.slaDashboard');
  const [data, setData] = useState<SLADataResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSLAData() {
      try {
        const slaData = await getSLADashboardData(tenantId, filters ?? undefined);
        setData(slaData);
      } catch (error) {
        console.error('Error fetching SLA data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSLAData();
  }, [tenantId, filters]);

  if (loading) {
    return <SLADashboardSkeleton />;
  }

  if (!data) {
    return (
      <EmptyState
        title={t('empty.title')}
        description={t('empty.description')}
        icons={[FileText, Target, Clock]}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Main SLA metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title={t('cards.compliance.title')} value={`${data.compliance.toFixed(1)}%`} trend={data.trends.complianceTrend} icon={<CheckCircle className="h-4 w-4" />} iconColor="text-emerald-500" />
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
        <MetricCard title={t('cards.avgSlaHours.title')} value={`${data.avgSlaHours}${t('cards.avgSlaHours.unit')}`} description={t('cards.avgSlaHours.description')} icon={<Calendar className="h-4 w-4" />} iconColor="text-purple-500" />
        <MetricCard title={t('cards.escalations.title')} value="0" trend={{ value: 0, isPositive: true, text: t('cards.escalations.trendText') }} icon={<TrendingUp className="h-4 w-4" />} iconColor="text-orange-500" />
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

      {/* Primary charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.pie.title')}</CardTitle>
            <CardDescription>{t('charts.pie.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.slaPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(props: any) => `${props.name ?? 'N/A'}: ${(Number(props.percent ?? 0) * 100).toFixed(0)}%`}>
                    {data.slaPieData.map((entry: SLADataEntry, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} ${t('charts.pie.tooltipUnit')}`, t('charts.pie.tooltipLabel')]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('charts.workflow.title')}</CardTitle>
            <CardDescription>{t('charts.workflow.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.slaWorkflowData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="onTime" name={t('charts.workflow.onTime')} stackId="a" fill="#3b82f6" />
                  <Bar dataKey="warning" name={t('charts.workflow.warning')} stackId="a" fill="#f59e0b" />
                  <Bar dataKey="overdue" name={t('charts.workflow.overdue')} stackId="a" fill="#ef4444" />
                  <Bar dataKey="completed" name={t('charts.workflow.completed')} stackId="a" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance trend */}
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.trend.title')}</CardTitle>
          <CardDescription>{t('charts.trend.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trendData}>
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" domain={[75, 100]} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="cumplimiento" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name={t('charts.trend.compliance')} />
                <Line yAxisId="left" type="monotone" dataKey="promedio" stroke="#d1d5db" strokeDasharray="5 5" name={t('charts.trend.target')} />
                <Bar yAxisId="right" dataKey="solicitudes" fill="#f59e0b" fillOpacity={0.7} name={t('charts.trend.totalRequests')} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Hourly analysis */}
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.hourly.title')}</CardTitle>
          <CardDescription>{t('charts.hourly.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.slaHourlyChartData}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="violations" stroke="#ef4444" name={t('charts.hourly.violations')} />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" name={t('charts.hourly.totalRequests')} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

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
