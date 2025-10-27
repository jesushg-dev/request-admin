'use client';

import { useEffect, useState } from 'react';
import { getWorkflowStatsByMonth } from '@/actions/dashboard';
import { BarChart2, FileText, TrendingUp } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/empty-state';

// Generar colores consistentes para workflows
const generateColor = (index: number, total: number): string => {
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
  return colors[index % colors.length];
};

interface DashboardStatsProps {
  tenantId: string;
  workflowId?: string | null;
}

function DashboardStatsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-64" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-96 mt-2" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex flex-col gap-4 justify-center items-center">
          {/* Simula barras del gráfico */}
          <div className="w-full flex items-end justify-around gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton className="w-full" style={{ height: `${Math.random() * 100 + 100}px` }} />
              </div>
            ))}
          </div>
          {/* Simula las etiquetas del eje X */}
          <div className="w-full flex justify-around">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-16" />
            ))}
          </div>
        </div>
        {/* Skeleton para la leyenda */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardStats({ tenantId, workflowId }: DashboardStatsProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkflowStats() {
      try {
        const { data, workflows: fetchedWorkflows } = await getWorkflowStatsByMonth(tenantId, 6, workflowId);
        setChartData(data);
        setWorkflows(fetchedWorkflows);
      } catch (error) {
        console.error('Error fetching workflow stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkflowStats();
  }, [tenantId, workflowId]);

  if (loading) {
    return <DashboardStatsSkeleton />;
  }

  if (chartData.length === 0) {
    return (
      <EmptyState
        title="No hay estadísticas disponibles"
        description="Aún no se han registrado solicitudes.\nLas estadísticas aparecerán aquí una vez que se creen solicitudes."
        icons={[FileText, BarChart2, TrendingUp]}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Solicitudes por Workflow</CardTitle>
        <CardDescription>Distribución de solicitudes por tipo de workflow en los últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  const nameStr = typeof name === 'string' ? name : String(name);
                  return [`${value} solicitudes`, nameStr];
                }}
                labelFormatter={(label) => `Mes: ${label}`}
              />
              {workflows.map((workflow, index) => (
                <Bar key={workflow.id} dataKey={workflow.name} fill={generateColor(index, workflows.length)} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {workflows.map((workflow, index) => (
            <div key={workflow.id} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: generateColor(index, workflows.length) }} />
              <span className="text-sm text-muted-foreground">{workflow.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
