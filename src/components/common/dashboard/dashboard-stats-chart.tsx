'use client';

import { BarChart2, FileText, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyState from '@/components/shared/empty-state';

type WorkflowSummary = {
  id: string;
  name: string;
};

type ChartPoint = Record<string, string | number>;

type DashboardStatsChartProps = {
  chartData: ChartPoint[];
  workflows: WorkflowSummary[];
};

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const generateColor = (index: number): string => COLORS[index % COLORS.length];

export function DashboardStatsChart({ chartData, workflows }: DashboardStatsChartProps) {
  const t = useTranslations('admin.dashboard.stats');

  if (chartData.length === 0) {
    return <EmptyState title={t('empty.title')} description={t('empty.description')} icons={[FileText, BarChart2, TrendingUp]} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  const label = typeof name === 'string' ? name : String(name);
                  return [`${value} ${t('tooltip.requests')}`, label];
                }}
                labelFormatter={(label) => `${t('tooltip.month')}: ${label}`}
              />
              {workflows.map((workflow, index) => (
                <Bar key={workflow.id} dataKey={workflow.name} fill={generateColor(index)} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {workflows.map((workflow, index) => (
            <div key={workflow.id} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: generateColor(index) }} />
              <span className="text-sm text-muted-foreground">{workflow.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default DashboardStatsChart;
