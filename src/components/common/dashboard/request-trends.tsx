'use client';

import * as React from 'react';
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Config with safe types for trends
const trendsConfig = {
  trends: {
    label: 'Request Trends',
    color: '#34c759', // Green
  },
} as const;

const trendData = [
  { date: '2024-01-01', requests: 15 },
  { date: '2024-01-02', requests: 20 },
  { date: '2024-01-03', requests: 10 },
  { date: '2024-01-04', requests: 25 },
  { date: '2024-01-05', requests: 18 },
];

export function RequestTrends() {
  return (
    <Card>
      <CardHeader className="flex flex-col items-center">
        <CardTitle>Request Trends</CardTitle>
        <CardDescription>{trendsConfig.trends.label}</CardDescription>
      </CardHeader>
      <CardContent>
        <LineChart width={500} height={300} data={trendData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="requests" stroke={trendsConfig.trends.color} />
        </LineChart>
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">Identify trends in request volume</CardFooter>
    </Card>
  );
}
