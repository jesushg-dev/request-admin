'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Función actualizada para obtener workflows con sus estados específicos
const getWorkflowTypes = () => {
  return [
    {
      id: 1,
      name: 'Activaciones',
      states: ['Borrador', 'En validación', 'En proceso', 'Activando', 'Completado'],
      color: '#ef4444',
    },
    {
      id: 2,
      name: 'Comisiones',
      states: ['Borrador', 'En revisión', 'Calculando', 'Aprobando', 'Completado'],
      color: '#3b82f6',
    },
    {
      id: 3,
      name: 'Soporte',
      states: ['Borrador', 'Diagnosticando', 'Resolviendo', 'Verificando', 'Completado'],
      color: '#10b981',
    },
    {
      id: 4,
      name: 'Facturación',
      states: ['Borrador', 'Verificando', 'Procesando', 'Ajustando', 'Completado'],
      color: '#f59e0b',
    },
  ];
};

// Función para generar datos que respete la estructura de workflows
const generateWorkflowData = () => {
  const workflowTypes = getWorkflowTypes();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];

  return months.map((month) => {
    const result: Record<string, number | string> = { name: month };

    // Para cada workflow, generar datos solo para sus estados específicos
    workflowTypes.forEach((workflow) => {
      // Total de solicitudes para este workflow
      result[workflow.name] = Math.floor(Math.random() * 50) + 20;

      // Datos por estado específico del workflow (excluyendo Borrador y Completado)
      workflow.states.forEach((state) => {
        if (state !== 'Borrador' && state !== 'Completado') {
          result[`${workflow.name}_${state}`] = Math.floor(Math.random() * 15) + 3;
        }
      });
    });

    return result;
  });
};

// Datos de ejemplo para el gráfico
const data = generateWorkflowData();

export default function DashboardStats() {
  const workflowTypes = getWorkflowTypes();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Solicitudes por Workflow</CardTitle>
        <CardDescription>Distribución de solicitudes por tipo de workflow en los últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  const nameStr = typeof name === 'string' ? name : String(name);
                  return [`${value} solicitudes`, nameStr.includes('_') ? nameStr.split('_')[1] : nameStr];
                }}
                labelFormatter={(label) => `Mes: ${label}`}
              />
              {workflowTypes.map((type) => (
                <Bar key={type.id} dataKey={type.name} fill={type.color} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>* Cada workflow tiene estados específicos que se muestran en las métricas del dashboard. Los estados &quot;Borrador&quot; y &quot;Completado&quot; son comunes a todos los workflows.</p>
        </div>
      </CardContent>
    </Card>
  );
}
