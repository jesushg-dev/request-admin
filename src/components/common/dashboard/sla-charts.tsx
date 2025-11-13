'use client';

import { useTranslations } from 'next-intl';
import { Area, AreaChart, Bar, BarChart, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SLAChartsProps {
  data: {
    slaPieData: Array<{ name: string; value: number; color: string; [key: string]: string | number }>;
    slaWorkflowData: Array<{ name: string; onTime: number; warning: number; overdue: number; completed: number }>;
    trendData: Array<{ name: string; cumplimiento: number; promedio: number; solicitudes: number }>;
    slaHourlyChartData: Array<{ hour: string; violations: number; total: number }>;
  };
}

export default function SLACharts({ data }: SLAChartsProps) {
  const t = useTranslations('admin.dashboard.slaDashboard');
  return (
    <>
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
                    {data.slaPieData.map((entry, index: number) => (
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
    </>
  );
}

