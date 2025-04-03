'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import ClientOnly from '@/components/client-only';

// Datos específicos para cada pestaña
const data = {
  categories: [
    { name: 'Technical Issue', count: 18 },
    { name: 'Service Request', count: 15 },
    { name: 'Incident', count: 12 },
    { name: 'Change Request', count: 9 },
    { name: 'Access Request', count: 6 },
    { name: 'Other', count: 5 },
    { name: 'Problem', count: 4 },
    { name: 'Project Request', count: 3 },
    { name: 'Training Request', count: 2 },
    { name: 'Consultation Request', count: 1 },
  ],
  areas: [
    { name: 'IT Support', count: 14 },
    { name: 'HR', count: 13 },
    { name: 'Finance', count: 24 },
    { name: 'Facilities', count: 11 },
    { name: 'Legal', count: 8 },
    { name: 'Marketing', count: 7 },
    { name: 'Sales', count: 6 },
  ],
  users: [
    { name: 'John Doe', count: 18 },
    { name: 'Jane Smith', count: 17 },
    { name: 'Bob Johnson', count: 16 },
    { name: 'Alice Williams', count: 15 },
    { name: 'Michael Brown', count: 14 },
    { name: 'Karen Davis', count: 13 },
    { name: 'William Miller', count: 12 },
    { name: 'Helen Wilson', count: 11 },
    { name: 'David Moore', count: 10 },
    { name: 'Maria Taylor', count: 9 },
    { name: 'James Anderson', count: 8 },
    { name: 'Jennifer Thomas', count: 7 },
    { name: 'Charles Jackson', count: 8 },
    { name: 'Patricia White', count: 5 },
    { name: 'Robert Harris', count: 4 },
    { name: 'Linda Martin', count: 3 },
    { name: 'Mark Thompson', count: 2 },
    { name: 'Barbara Garcia', count: 1 },
    { name: 'Richard Martinez', count: 1 },
    { name: 'Susan Robinson', count: 1 },
    { name: 'Joseph Clark', count: 20 },
  ],
};

const chartConfig = {
  categories: {
    label: 'Categories',
    color: 'hsl(var(--chart-1))',
  },
  areas: {
    label: 'Areas',
    color: 'hsl(var(--chart-2))',
  },
  users: {
    label: 'Users',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

function AssignmentDashboard() {
  const [activeTab, setActiveTab] = React.useState<keyof typeof data>('categories');

  // Calcular el total para cada pestaña
  const totals = React.useMemo(() => {
    return {
      categories: data.categories.reduce((acc, item) => acc + item.count, 0),
      areas: data.areas.reduce((acc, item) => acc + item.count, 0),
      users: data.users.reduce((acc, item) => acc + item.count, 0),
    };
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Assignment Dashboard</CardTitle>
          <CardDescription>Overview of assigned requests by {chartConfig[activeTab].label.toLowerCase()}</CardDescription>
        </div>
        <div className="flex">
          {Object.keys(data).map((key) => {
            const tab = key as keyof typeof data;
            return (
              <button
                key={tab}
                data-active={activeTab === tab}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveTab(tab)}>
                <span className="text-muted-foreground text-xs">{chartConfig[tab].label}</span>
                <span className="text-lg leading-none font-bold sm:text-3xl">{totals[tab].toLocaleString()}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ClientOnly>
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <BarChart data={data[activeTab]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barCategoryGap="20%">
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent className="w-[150px]" nameKey="name" labelFormatter={(value) => value} />} />
              <Bar dataKey="count" fill={chartConfig[activeTab].color} />
            </BarChart>
          </ChartContainer>
        </ClientOnly>
      </CardContent>
    </Card>
  );
}

export default AssignmentDashboard;
