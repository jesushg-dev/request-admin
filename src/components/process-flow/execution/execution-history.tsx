'use client';

import type { ExecutionHistoryEntry, FlowNode } from '@/types/execution';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ExecutionHistoryProps {
  executionHistory: ExecutionHistoryEntry[];
  nodes: FlowNode[];
}

export function ExecutionHistory({ executionHistory, nodes }: ExecutionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Ejecución</CardTitle>
        <CardDescription>Pasos completados: {executionHistory.length}</CardDescription>
      </CardHeader>
      <CardContent>
        {executionHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4">No hay pasos completados aún</p>
        ) : (
          <div className="divide-y">
            {executionHistory.map((entry, index) => {
              const node = nodes.find((n) => n.id === entry.nodeId);
              if (!node) return null;

              return (
                <div key={index} className="p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-medium">{index + 1}</div>
                      <p className="font-medium">{node.data.label}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{entry.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm ml-8">{entry.action}</p>
                  {entry.details && <p className="text-xs text-muted-foreground ml-8">{entry.details}</p>}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
