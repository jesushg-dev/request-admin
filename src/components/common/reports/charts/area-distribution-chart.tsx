'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { AreaDistribution } from '../types';

interface AreaDistributionChartProps {
  data: AreaDistribution[];
  loading: boolean;
}

export function AreaDistributionChart({ data, loading }: AreaDistributionChartProps) {
  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Distribución por Área</CardTitle>
          <CardDescription>Porcentaje de solicitudes por área</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Distribución por Área</CardTitle>
          <CardDescription>Porcentaje de solicitudes por área</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No hay datos disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Distribución por Área</CardTitle>
        <CardDescription>Porcentaje de solicitudes por área</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={(entry) => `${entry.name as string} ${(((entry.percent as number) ?? 0) * 100).toFixed(0)}%`}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
