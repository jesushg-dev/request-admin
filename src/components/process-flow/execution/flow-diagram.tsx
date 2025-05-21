'use client';

import { Background, BackgroundVariant, Controls, ReactFlow, ReactFlowProvider } from '@xyflow/react';
import type { NodeTypes } from '@xyflow/react';

import type { FlowEdge, FlowNode } from '@/types/execution-flow';

interface FlowDiagramProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  nodeTypes: NodeTypes;
}

export function FlowDiagram({ nodes, edges, nodeTypes }: FlowDiagramProps) {
  return (
    <div className="border rounded-lg overflow-hidden h-full">
      <ReactFlowProvider>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={0.5} maxZoom={2} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}>
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
