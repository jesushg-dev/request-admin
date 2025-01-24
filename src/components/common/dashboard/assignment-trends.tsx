'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const chartData = [
  { date: '2024-04-01', user: 222, area: 150 },
  { date: '2024-04-02', user: 97, area: 180 },
  { date: '2024-04-03', user: 167, area: 120 },
  { date: '2024-04-04', user: 242, area: 260 },
  { date: '2024-04-05', user: 373, area: 290 },
  { date: '2024-04-06', user: 301, area: 340 },
  { date: '2024-04-07', user: 245, area: 180 },
  { date: '2024-04-08', user: 409, area: 320 },
  { date: '2024-04-09', user: 59, area: 110 },
  { date: '2024-04-10', user: 261, area: 190 },
  { date: '2024-04-11', user: 327, area: 350 },
  { date: '2024-04-12', user: 292, area: 210 },
  { date: '2024-04-13', user: 342, area: 380 },
  { date: '2024-04-14', user: 137, area: 220 },
  { date: '2024-04-15', user: 120, area: 170 },
  { date: '2024-04-16', user: 138, area: 190 },
  { date: '2024-04-17', user: 446, area: 360 },
  { date: '2024-04-18', user: 364, area: 410 },
  { date: '2024-04-19', user: 243, area: 180 },
  { date: '2024-04-20', user: 89, area: 150 },
  { date: '2024-04-21', user: 137, area: 200 },
  { date: '2024-04-22', user: 224, area: 170 },
  { date: '2024-04-23', user: 138, area: 230 },
  { date: '2024-04-24', user: 387, area: 290 },
  { date: '2024-04-25', user: 215, area: 250 },
  { date: '2024-04-26', user: 75, area: 130 },
  { date: '2024-04-27', user: 383, area: 420 },
  { date: '2024-04-28', user: 122, area: 180 },
  { date: '2024-04-29', user: 315, area: 240 },
  { date: '2024-04-30', user: 454, area: 380 },
  { date: '2024-05-01', user: 165, area: 220 },
  { date: '2024-05-02', user: 293, area: 310 },
  { date: '2024-05-03', user: 247, area: 190 },
  { date: '2024-05-04', user: 385, area: 420 },
  { date: '2024-05-05', user: 481, area: 390 },
  { date: '2024-05-06', user: 498, area: 520 },
  { date: '2024-05-07', user: 388, area: 300 },
  { date: '2024-05-08', user: 149, area: 210 },
  { date: '2024-05-09', user: 227, area: 180 },
  { date: '2024-05-10', user: 293, area: 330 },
  { date: '2024-05-11', user: 335, area: 270 },
  { date: '2024-05-12', user: 197, area: 240 },
  { date: '2024-05-13', user: 197, area: 160 },
  { date: '2024-05-14', user: 448, area: 490 },
  { date: '2024-05-15', user: 473, area: 380 },
  { date: '2024-05-16', user: 338, area: 400 },
  { date: '2024-05-17', user: 499, area: 420 },
  { date: '2024-05-18', user: 315, area: 350 },
  { date: '2024-05-19', user: 235, area: 180 },
  { date: '2024-05-20', user: 177, area: 230 },
  { date: '2024-05-21', user: 82, area: 140 },
  { date: '2024-05-22', user: 81, area: 120 },
  { date: '2024-05-23', user: 252, area: 290 },
  { date: '2024-05-24', user: 294, area: 220 },
  { date: '2024-05-25', user: 201, area: 250 },
  { date: '2024-05-26', user: 213, area: 170 },
  { date: '2024-05-27', user: 420, area: 460 },
  { date: '2024-05-28', user: 233, area: 190 },
  { date: '2024-05-29', user: 78, area: 130 },
  { date: '2024-05-30', user: 340, area: 280 },
  { date: '2024-05-31', user: 178, area: 230 },
  { date: '2024-06-01', user: 178, area: 200 },
  { date: '2024-06-02', user: 470, area: 410 },
  { date: '2024-06-03', user: 103, area: 160 },
  { date: '2024-06-04', user: 439, area: 380 },
  { date: '2024-06-05', user: 88, area: 140 },
  { date: '2024-06-06', user: 294, area: 250 },
  { date: '2024-06-07', user: 323, area: 370 },
  { date: '2024-06-08', user: 385, area: 320 },
  { date: '2024-06-09', user: 438, area: 480 },
  { date: '2024-06-10', user: 155, area: 200 },
  { date: '2024-06-11', user: 92, area: 150 },
  { date: '2024-06-12', user: 492, area: 420 },
  { date: '2024-06-13', user: 81, area: 130 },
  { date: '2024-06-14', user: 426, area: 380 },
  { date: '2024-06-15', user: 307, area: 350 },
  { date: '2024-06-16', user: 371, area: 310 },
  { date: '2024-06-17', user: 475, area: 520 },
  { date: '2024-06-18', user: 107, area: 170 },
  { date: '2024-06-19', user: 341, area: 290 },
  { date: '2024-06-20', user: 408, area: 450 },
  { date: '2024-06-21', user: 169, area: 210 },
  { date: '2024-06-22', user: 317, area: 270 },
  { date: '2024-06-23', user: 480, area: 530 },
  { date: '2024-06-24', user: 132, area: 180 },
  { date: '2024-06-25', user: 141, area: 190 },
  { date: '2024-06-26', user: 434, area: 380 },
  { date: '2024-06-27', user: 448, area: 490 },
  { date: '2024-06-28', user: 149, area: 200 },
  { date: '2024-06-29', user: 103, area: 160 },
  { date: '2024-06-30', user: 446, area: 400 },
];

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

export function AssignmentTrends() {
  const [timeRange, setTimeRange] = React.useState('90d');

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date('2024-06-30');
    let daysToSubtract = 90;
    if (timeRange === '30d') {
      daysToSubtract = 30;
    } else if (timeRange === '7d') {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Assignment Trends (Last 30 days)</CardTitle>
          <CardDescription>A summary of the number of assignments made over time by users and areas.</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label="Select a value">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
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
