'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getWorkflowStatsByMonth } from '@/actions/dashboard';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Generar colores consistentes para workflows
const generateColor = (index: number, total: number): string => {
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
  return colors[index % colors.length];
};

interface DashboardStatsProps {
  tenantId: string;
  workflowId?: string | null;
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando estadísticas...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Cargando datos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Solicitudes por Workflow</CardTitle>
          <CardDescription>No hay datos disponibles para mostrar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No hay solicitudes en los últimos 6 meses</p>
          </div>
        </CardContent>
      </Card>
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
