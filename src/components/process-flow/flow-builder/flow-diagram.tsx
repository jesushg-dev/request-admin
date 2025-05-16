import type React from 'react';
import { Background, Controls, ReactFlow, ReactFlowProvider, type NodeProps } from '@xyflow/react';

import '@xyflow/react/dist/style.css';

interface NodeData {
  label?: string;
  description?: string;
  properties?: Record<string, unknown>;
  [key: string]: unknown;
}

interface FlowNode {
  id: string;
  type?: string;
  data: NodeData;
  position: { x: number; y: number };
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

interface FlowDiagramProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  nodeTypes: Record<string, React.ComponentType<NodeProps>>;
}

const FlowDiagram: React.FC<FlowDiagramProps> = ({ nodes, edges, nodeTypes }) => {
  return (
    <ReactFlowProvider>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background variant="dots" gap={12} size={1} />
        <Controls />
      </ReactFlow>
    </ReactFlowProvider>
  );
};

export default FlowDiagram;
