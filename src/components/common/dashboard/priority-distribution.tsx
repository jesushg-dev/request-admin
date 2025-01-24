'use client';

import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  High: {
    label: 'High Priority',
    color: '#ff3b30',
  },
  Medium: {
    label: 'Medium Priority',
    color: '#ffcc00',
  },
  Low: {
    label: 'Low Priority',
    color: '#34c759',
  },
} as const;

const priorityData = [
  { priority: 'High', count: 40, fill: chartConfig.High.color },
  { priority: 'Medium', count: 35, fill: chartConfig.Medium.color },
  { priority: 'Low', count: 25, fill: chartConfig.Low.color },
];

export function PriorityDistribution() {
  const totalRequests = React.useMemo(() => {
    return priorityData.reduce((acc, curr) => acc + curr.count, 0);
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Priority Distribution</CardTitle>
        <CardDescription>Requests classified by priority level</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={priorityData} dataKey="count" nameKey="priority" innerRadius={60} strokeWidth={5}>
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
      <CardFooter className="text-muted-foreground leading-none">Total requests classified by urgency level</CardFooter>
    </Card>
  );
}
