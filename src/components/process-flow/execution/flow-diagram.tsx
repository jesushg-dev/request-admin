'use client';

import type React from 'react';
import { Background, Controls, ReactFlow, ReactFlowProvider } from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import type { FlowEdge, FlowNode } from '@/types/execution';

// Definición de las props que reciben los componentes de nodo en ReactFlow
interface NodeProps {
  id: string;
  type?: string;
  data: {
    label?: string;
    [key: string]: unknown;
  };
  selected?: boolean;
  isConnectable?: boolean;
  xPos: number;
  yPos: number;
  dragging?: boolean;
}

interface FlowDiagramProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  nodeTypes: Record<string, React.ComponentType<NodeProps>>;
}

export function FlowDiagram({ nodes, edges, nodeTypes }: FlowDiagramProps) {
  return (
    <div className="border rounded-lg overflow-hidden h-full">
      <ReactFlowProvider>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={0.5} maxZoom={2} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}>
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
