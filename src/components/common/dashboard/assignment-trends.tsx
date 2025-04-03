'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  user: {
    label: 'Users',
    color: 'hsl(var(--chart-1))',
  },
  area: {
    label: 'Areas',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

function AssignmentTrends({ initialData, initialRange }: { initialData: Array<{ date: string; user: number; area: number }>; initialRange: string }) {
  const t = useTranslations('admin.dashboard.assignmentTrends');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [timeRange, setTimeRange] = React.useState(initialRange);

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('timeRange', timeRange);
    router.replace(`${pathname}?${params.toString()}`);
  }, [timeRange, router, pathname, searchParams]);

  const timeRangeLabels = {
    '90d': t('last3Months'),
    '30d': t('last30Days'),
    '7d': t('last7Days'),
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>
            {t('assignmentTrends')} ({timeRangeLabels[timeRange as keyof typeof timeRangeLabels]})
          </CardTitle>
          <CardDescription>{t('cardDescription')}</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label={t('selectTimeRange')}>
            <SelectValue placeholder={t('last3Months')} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              {t('last3Months')}
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              {t('last30Days')}
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              {t('last7Days')}
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={initialData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-user)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-user)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-area)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-area)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="area" type="natural" fill="url(#fillMobile)" stroke="var(--color-area)" stackId="a" />
            <Area dataKey="user" type="natural" fill="url(#fillDesktop)" stroke="var(--color-user)" stackId="a" />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default AssignmentTrends;
