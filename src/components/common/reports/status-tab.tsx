'use client';

import { FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/empty-state';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { StatusDistribution } from './types';

interface StatusTabProps {
  statusDistribution: StatusDistribution[];
  loading: boolean;
}

export function StatusTab({ statusDistribution, loading }: StatusTabProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="w-64 h-64 rounded-full border-4 border-muted flex items-center justify-center">
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!statusDistribution || statusDistribution.length === 0) {
    return (
      <EmptyState
        title="No hay datos de estados disponibles"
        description="Aún no se han registrado solicitudes.\nLos datos aparecerán aquí una vez que haya solicitudes con estados asignados."
        icons={[FileText]}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitudes por Estado</CardTitle>
        <CardDescription>Distribución actual de solicitudes según su estado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={statusDistribution} 
                cx="50%" 
                cy="50%" 
                outerRadius={150} 
                dataKey="value" 
                label={(entry) => `${(entry.name as string)} ${(((entry.percent as number) ?? 0) * 100).toFixed(0)}%`}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#6b7280'} />
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

