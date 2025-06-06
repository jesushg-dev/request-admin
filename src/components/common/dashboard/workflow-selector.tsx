'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkflowSelectorProps {
  selectedWorkflow: string | null;
  onWorkflowChange: (workflowId: string | null) => void;
}

interface WorkflowStats {
  id: string;
  name: string;
  count: number;
  change: number;
  icon: string;
}

// Datos de ejemplo de workflows disponibles
const availableWorkflows = [
  { id: 'soporte-tecnico', name: 'Soporte Técnico' },
  { id: 'activaciones', name: 'Activaciones' },
  { id: 'facturacion', name: 'Facturación' },
  { id: 'cambios-plan', name: 'Cambios de Plan' },
  { id: 'reclamos', name: 'Reclamos' },
];

// Datos de ejemplo de estadísticas por workflow
const workflowStatsData: Record<string, WorkflowStats[]> = {
  'soporte-tecnico': [
    { id: 'diagnosticando', name: 'Diagnosticando', count: 18, change: -1.7, icon: '🔍' },
    { id: 'en-proceso', name: 'En proceso', count: 35, change: 4.3, icon: '⚙️' },
    { id: 'esperando-cliente', name: 'Esperando cliente', count: 12, change: 2.1, icon: '⏳' },
    { id: 'resolviendo', name: 'Resolviendo', count: 22, change: 4.6, icon: '🔧' },
  ],
  activaciones: [
    { id: 'validando-datos', name: 'Validando datos', count: 28, change: 3.2, icon: '✅' },
    { id: 'activando', name: 'Activando', count: 12, change: 3.5, icon: '🔄' },
    { id: 'configurando', name: 'Configurando', count: 15, change: -0.8, icon: '⚙️' },
    { id: 'completando', name: 'Completando', count: 8, change: 1.9, icon: '✨' },
  ],
  facturacion: [
    { id: 'revisando', name: 'Revisando', count: 24, change: 2.8, icon: '📋' },
    { id: 'calculando', name: 'Calculando', count: 16, change: -1.2, icon: '🧮' },
    { id: 'aprobando', name: 'Aprobando', count: 9, change: 5.1, icon: '✅' },
    { id: 'procesando', name: 'Procesando', count: 31, change: 3.7, icon: '💳' },
  ],
  'cambios-plan': [
    { id: 'evaluando', name: 'Evaluando', count: 19, change: 1.4, icon: '📊' },
    { id: 'aprobando-cambio', name: 'Aprobando cambio', count: 7, change: -2.3, icon: '✅' },
    { id: 'implementando', name: 'Implementando', count: 13, change: 4.8, icon: '🔄' },
    { id: 'notificando', name: 'Notificando', count: 5, change: 0.9, icon: '📢' },
  ],
  reclamos: [
    { id: 'investigando', name: 'Investigando', count: 22, change: 2.6, icon: '🔍' },
    { id: 'escalando', name: 'Escalando', count: 8, change: -1.5, icon: '⬆️' },
    { id: 'resolviendo-reclamo', name: 'Resolviendo', count: 14, change: 3.9, icon: '🛠️' },
    { id: 'cerrando', name: 'Cerrando', count: 6, change: 1.2, icon: '✅' },
  ],
};

export function WorkflowSelector({ selectedWorkflow, onWorkflowChange }: WorkflowSelectorProps) {
  const [stats, setStats] = useState<WorkflowStats[]>([]);

  useEffect(() => {
    if (selectedWorkflow && workflowStatsData[selectedWorkflow]) {
      setStats(workflowStatsData[selectedWorkflow]);
    } else {
      setStats([]);
    }
  }, [selectedWorkflow]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Estadísticas por flujo de trabajo</h2>
          <p className="text-sm text-muted-foreground mt-1">Selecciona un flujo de trabajo para ver métricas específicas</p>
        </div>
        <div className="w-80">
          <Select value={selectedWorkflow || ''} onValueChange={(value) => onWorkflowChange(value || null)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione un flujo de trabajo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los flujos</SelectItem>
              {availableWorkflows.map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedWorkflow && stats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Solicitudes en {stat.name}</CardTitle>
                  <span className="text-lg">{stat.icon}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.count}</div>
                <div className="mt-2 flex items-center text-sm">
                  <span className={`flex items-center ${stat.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}% vs. mes anterior
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedWorkflow && stats.length === 0 && (
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-muted-foreground">No hay datos disponibles para este flujo de trabajo</p>
          </CardContent>
        </Card>
      )}

      {!selectedWorkflow && (
        <Card className="p-8 text-center border-dashed">
          <CardContent>
            <div className="text-muted-foreground mb-2">
              <ChevronDown className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-muted-foreground">Selecciona un flujo de trabajo para ver las estadísticas específicas</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
