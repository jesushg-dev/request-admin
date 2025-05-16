'use client';

import type { FlowNode } from '@/types/execution';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NodeDetailsProps {
  node: FlowNode;
}

export function NodeDetails({ node }: NodeDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles del Nodo</CardTitle>
        <CardDescription>Información detallada del nodo seleccionado</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium">Etiqueta</h4>
          <p>{node.data.label}</p>
        </div>
        {node.type === 'step' && (
          <>
            <div>
              <h4 className="text-sm font-medium">Acción</h4>
              <p>{node.data.action || 'No definida'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Responsable</h4>
              <p>{node.data.responsible || 'No definido'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Tiempo Estimado</h4>
              <p>
                {node.data.estimatedTime} {node.data.timeUnit}
              </p>
            </div>
          </>
        )}
        {node.type === 'condition' && (
          <div>
            <h4 className="text-sm font-medium">Expresión</h4>
            <p>{node.data.expression || 'No definida'}</p>
          </div>
        )}
        {node.type === 'loop' && (
          <>
            <div>
              <h4 className="text-sm font-medium">Condición</h4>
              <p>{node.data.condition || 'No definida'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Iteraciones Máximas</h4>
              <p>{node.data.maxIterations}</p>
            </div>
          </>
        )}
        {node.type === 'notification' && (
          <>
            <div>
              <h4 className="text-sm font-medium">Canal</h4>
              <p>{node.data.channel || 'No definido'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Mensaje</h4>
              <p>{node.data.message || 'No definido'}</p>
            </div>
          </>
        )}
        {node.type === 'timer' && (
          <>
            <div>
              <h4 className="text-sm font-medium">Duración</h4>
              <p>
                {node.data.duration} {node.data.timeUnit}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
