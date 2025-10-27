'use client';

import { BarChart2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/empty-state';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AreaDistribution } from './types';

interface AreasTabProps {
  areaDistribution: AreaDistribution[];
  loading: boolean;
}

export function AreasTab({ areaDistribution, loading }: AreasTabProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex flex-col gap-4 justify-center items-center">
            <div className="w-full flex items-end justify-around gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <Skeleton className="w-full" style={{ height: `${Math.random() * 100 + 100}px` }} />
                </div>
              ))}
            </div>
            <div className="w-full flex justify-around">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-3 w-16" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!areaDistribution || areaDistribution.length === 0) {
    return (
      <EmptyState
        title="No hay datos de áreas disponibles"
        description="Aún no se han registrado solicitudes por área.\nLos datos aparecerán aquí una vez que haya solicitudes asignadas a áreas."
        icons={[BarChart2]}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitudes por Área</CardTitle>
        <CardDescription>Análisis detallado por área</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={areaDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Solicitudes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

