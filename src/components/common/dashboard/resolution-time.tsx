'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Config with safe types for resolution time
const resolutionConfig = {
  resolutionTime: {
    label: 'Average Resolution Time',
    color: '#007aff', // Blue
  },
} as const;

const resolutionData = [
  { category: 'Technical Issue', avgTime: 5 },
  { category: 'Service Request', avgTime: 3 },
  { category: 'Incident', avgTime: 4 },
];

export function ResolutionTime() {
  return (
    <Card>
      <CardHeader className="flex flex-col items-center">
        <CardTitle>Average Resolution Time</CardTitle>
        <CardDescription>{resolutionConfig.resolutionTime.label}</CardDescription>
      </CardHeader>
      <CardContent>
        <BarChart width={500} height={300} data={resolutionData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis allowDecimals={false} />
          <Bar dataKey="avgTime" fill={resolutionConfig.resolutionTime.color} />
        </BarChart>
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">Helps track and improve resolution efficiency</CardFooter>
    </Card>
  );
}
