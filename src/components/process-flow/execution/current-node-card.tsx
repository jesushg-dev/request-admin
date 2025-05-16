'use client';

import type { FlowNode, PendingDecision } from '@/types/execution';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CurrentNodeCardProps {
  node: FlowNode;
  pendingDecision: PendingDecision | null;
  onDecision: (outcome: string) => void;
}

export function CurrentNodeCard({ node, pendingDecision, onDecision }: CurrentNodeCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Nodo Actual</CardTitle>
          <Badge className="bg-blue-100 text-blue-800">En Progreso</Badge>
        </div>
        <CardDescription>
          {node.type.charAt(0).toUpperCase() + node.type.slice(1)}: {node.data.label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderNodeDetails(node)}

        {pendingDecision && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
            <p className="text-sm font-medium mb-2">Se requiere una decisión:</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {pendingDecision.options.map((option, index) => (
                <div key={index} className="flex flex-col gap-1 w-full">
                  <Button size="sm" variant={index === 0 ? 'default' : 'outline'} onClick={() => onDecision(option.value)} className="w-full">
                    {option.label}
                  </Button>
                  {option.target && <p className="text-xs text-muted-foreground text-center">Siguiente: {option.target}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Función para renderizar detalles específicos del nodo
function renderNodeDetails(node: FlowNode) {
  switch (node.type) {
    case 'step':
      return (
        <div className="space-y-2">
          {node.data.action && (
            <div>
              <p className="text-sm font-medium">Acción:</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{node.data.action}</p>
            </div>
          )}
          {node.data.responsible && (
            <div>
              <p className="text-sm font-medium">Responsable:</p>
              <p className="text-sm">{node.data.responsible}</p>
            </div>
          )}
          {node.data.estimatedTime && (
            <div>
              <p className="text-sm font-medium">Tiempo estimado:</p>
              <p className="text-sm">
                {node.data.estimatedTime} {node.data.timeUnit}
              </p>
            </div>
          )}
        </div>
      );

    case 'condition':
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">Expresión:</p>
          <p className="text-sm bg-gray-50 p-2 rounded">{node.data.expression || 'No definida'}</p>
        </div>
      );

    case 'timer':
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">Duración:</p>
          <p className="text-sm">
            {node.data.duration} {node.data.timeUnit}
          </p>
        </div>
      );

    case 'notification':
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">Canal:</p>
          <p className="text-sm">{node.data.channel || 'email'}</p>
          {node.data.message && (
            <div>
              <p className="text-sm font-medium">Mensaje:</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{node.data.message}</p>
            </div>
          )}
        </div>
      );

    case 'approval':
      return (
        <div className="space-y-2">
          {node.data.approvers && node.data.approvers.length > 0 && (
            <div>
              <p className="text-sm font-medium">Aprobadores:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {node.data.approvers.map((approver: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-gray-50">
                    {approver}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 'task':
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">Tipo:</p>
          <p className="text-sm">{node.data.type || 'manual'}</p>
          {node.data.details && (
            <div>
              <p className="text-sm font-medium">Detalles:</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{node.data.details}</p>
            </div>
          )}
        </div>
      );

    case 'loop':
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">Condición:</p>
          <p className="text-sm bg-gray-50 p-2 rounded">{node.data.condition || 'No definida'}</p>
          <p className="text-sm font-medium">Iteraciones máximas:</p>
          <p className="text-sm">{node.data.maxIterations}</p>
        </div>
      );

    default:
      return <p className="text-sm text-muted-foreground">No hay detalles adicionales para este tipo de nodo.</p>;
  }
}
