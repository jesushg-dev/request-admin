'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartData = [
  { status: 'Within SLA', count: 75, fill: '#34c759' }, // Verde
  { status: 'Nearing Deadline', count: 15, fill: '#ffcc00' }, // Amarillo
  { status: 'Overdue', count: 10, fill: '#ff3b30' }, // Rojo
];

const chartConfig = {
  count: {
    label: 'Count',
  },
  withinSla: {
    label: 'Within SLA',
    color: '#34c759',
  },
  nearingDeadline: {
    label: 'Nearing Deadline',
    color: '#ffcc00',
  },
  overdue: {
    label: 'Overdue',
    color: '#ff3b30',
  },
} satisfies ChartConfig;

export function SlaCompliance() {
  const totalRequests = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>SLA Compliance</CardTitle>
        <CardDescription>Current Status Overview</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {totalRequests.toLocaleString()}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Status as of today <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">Current SLA compliance status</div>
      </CardFooter>
    </Card>
  );
}
