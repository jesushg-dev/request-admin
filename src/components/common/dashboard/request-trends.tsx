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

function RequestTrends({
  trends,
}: {
  trends: {
    date: string;
    count: number;
  }[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col items-center">
        <CardTitle>Request Trends</CardTitle>
        <CardDescription>{trendsConfig.trends.label}</CardDescription>
      </CardHeader>
      <CardContent>
        <LineChart width={500} height={300} data={trends} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke={trendsConfig.trends.color} />
        </LineChart>
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">Identify trends in request volume</CardFooter>
    </Card>
  );
}

export default RequestTrends;
