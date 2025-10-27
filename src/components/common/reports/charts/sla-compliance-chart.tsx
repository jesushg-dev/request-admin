'use client';

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SLACompliance {
  name: string;
  cumplimiento: number;
}

interface SLAComplianceChartProps {
  data: SLACompliance[];
  loading: boolean;
}

export function SLAComplianceChart({ data, loading }: SLAComplianceChartProps) {
  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Cumplimiento de SLA</CardTitle>
          <CardDescription>Evolución del cumplimiento del SLA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Cumplimiento de SLA</CardTitle>
        <CardDescription>Evolución del cumplimiento del SLA</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="cumplimiento" name="% Cumplimiento" stroke="#10b981" fill="#10b981" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
