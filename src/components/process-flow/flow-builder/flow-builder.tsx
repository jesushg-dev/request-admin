'use client';

import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import type { Connection } from '@xyflow/react';
import { addEdge, Background, BackgroundVariant, Controls, MarkerType, Panel, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import type { FlowEdge, FlowNode, FlowNodeType, NodeData, ProcessFlow } from '@/types/execution-flow';
import { getDefaultDataForType, isValidNodeType } from '@/lib/execution-flow';
import { useFullscreen } from '@/hooks/use-full-screen';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { AlertBanner } from '@/components/custom-ui/alert-banner';

import { FlowBuilderControls, SelectedEdge } from './flow-builder-utils';
import NodePalette from './node-palette';
import { nodeTypes } from './nodes';
import PropertiesPanel from './properties-panel';
import SimulationControls from './simulation-controls';
import { useValidationFlow } from './use-validation';

interface ValidationError {
  nodeId?: string;
  message: string;
}

const initialNodes: FlowNode[] = [
  {
    id: '1',
    type: 'start',
    position: { x: 250, y: 5 },
    data: { label: 'Start' } as NodeData<'start'>,
  },
];

const initialEdges: FlowEdge[] = [];

function FlowBuilderNonContext() {
  const t = useTranslations('component.flowExecution.build');
  const theme = useTheme();
  const reactFlow = useReactFlow<FlowNode, FlowEdge>();
  const { validateFlow } = useValidationFlow();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { ref: containerRef, isFullscreen, toggleFullscreen: handleFullscreenToggle } = useFullscreen<HTMLDivElement>();

  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<FlowEdge | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>(initialEdges);

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');

  const onConnect = useCallback(
    (params: Connection) => {
      const isLoop = params.source === params.target;
      const newEdge: FlowEdge = {
        ...params,
        id: `${params.source}-${params.target}`,
        animated: isLoop,
        style: { stroke: isLoop ? '#ff0072' : '#555' },
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        type: 'smoothstep',
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!reactFlowWrapper.current || !reactFlow) return;

      const type = event.dataTransfer.getData('application/reactflow') as FlowNodeType;
      if (!isValidNodeType(type)) return;

      const { left, top } = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlow.screenToFlowPosition({
        x: event.clientX - left,
        y: event.clientY - top,
      });

      const newNode: FlowNode = {
        id: `${Date.now()}`,
        type,
        position,
        data: getDefaultDataForType(type),
      } as FlowNode;

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowWrapper.current, reactFlow, setNodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: FlowNode) => {
    setSelectedNode(node);
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: FlowEdge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onNodesDelete = useCallback(
    (nodesToDelete: FlowNode[]) => {
      setNodes((nds) => nds.filter((node) => !nodesToDelete.some((n) => n.id === node.id)));
      setEdges((eds) => eds.filter((edge) => !nodesToDelete.some((node) => node.id === edge.source || node.id === edge.target)));
      if (nodesToDelete.some((node) => node.id === selectedNode?.id)) {
        setSelectedNode(null);
      }
    },
    [selectedNode, setNodes, setEdges]
  );

  const onEdgesDelete = useCallback(
    (edgesToDelete: FlowEdge[]) => {
      setEdges((eds) => eds.filter((edge) => !edgesToDelete.some((e) => e.id === edge.id)));
      if (edgesToDelete.some((edge) => edge.id === selectedEdge?.id)) {
        setSelectedEdge(null);
      }
    },
    [selectedEdge, setEdges]
  );

  const deleteSelectedEdge = useCallback(() => {
    if (selectedEdge) onEdgesDelete([selectedEdge]);
  }, [selectedEdge, onEdgesDelete]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const onNodeDataChange = useCallback(
    <T extends FlowNodeType>(nodeId: string, newData: NodeData<T>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, ...newData } as NodeData<T>,
            } as FlowNode;
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const handleValidateFlow = useCallback(() => {
    const errors = validateFlow(nodes, edges);
    setValidationErrors(errors);

    if (errors.length === 0) {
      const processFlow: ProcessFlow = { nodes, edges };
      localStorage.setItem('itil-process-flow', JSON.stringify(processFlow));
    }
  }, [nodes, edges, validateFlow]);

  const handleSaveFlow = useCallback(() => {
    if (reactFlow) {
      const flow = reactFlow.toObject();
      localStorage.setItem('itil-flow', JSON.stringify(flow));
    }
  }, [reactFlow]);

  const handleLoadFlow = useCallback(() => {
    const savedFlow = localStorage.getItem('itil-flow');
    if (savedFlow) {
      const flow = JSON.parse(savedFlow) as ProcessFlow;
      setNodes(flow.nodes);
      setEdges(flow.edges);
    }
  }, [setNodes, setEdges]);

  const handleExportFlow = useCallback(() => {
    if (reactFlow) {
      const flow = reactFlow.toObject();
      const dataStr = JSON.stringify(flow, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = 'request-flow.json';
      link.click();
    }
  }, [reactFlow]);

  const toggleSimulation = useCallback(() => {
    setIsSimulating((prev) => !prev);
    setActiveTab((prev) => (prev === 'editor' ? 'simulation' : 'editor'));
  }, []);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden border rounded-md">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden" ref={containerRef}>
        <div className="flex border-b bg-background">
          <FlowBuilderControls
            isFullscreen={isFullscreen}
            isSimulating={isSimulating}
            handleLoadFlow={handleLoadFlow}
            handleExportFlow={handleExportFlow}
            handleValidateFlow={handleValidateFlow}
            toggleSimulation={toggleSimulation}
            handleFullscreenToggle={handleFullscreenToggle}
            handleSaveFlow={handleSaveFlow}
          />
        </div>

        <div className="flex flex-1 overflow-hidden bg-background">
          <TabsContent value="editor" className="flex-1 m-0 h-full">
            <div className="flex-1 h-full" ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onEdgesDelete={onEdgesDelete}
                onPaneClick={onPaneClick}
                onNodesDelete={onNodesDelete}
                nodeTypes={nodeTypes}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
                colorMode={theme.theme === 'dark' ? 'dark' : 'light'}>
                <Controls />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                {selectedEdge && (
                  <Panel position="top-center" className="bg-white p-2 rounded shadow-md">
                    <SelectedEdge source={selectedEdge.source} target={selectedEdge.target} onDelete={deleteSelectedEdge} />
                  </Panel>
                )}
                {validationErrors.length > 0 && (
                  <Panel position="bottom-center">
                    <AlertBanner
                      title={t('validation.title')}
                      variant="error"
                      description={
                        <ul className="pl-5 list-disc">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error.message}</li>
                          ))}
                        </ul>
                      }
                    />
                  </Panel>
                )}
              </ReactFlow>
            </div>
          </TabsContent>

          <TabsContent value="simulation" className="flex-1 m-0 h-full">
            <div className="flex-1 h-full">
              <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView snapToGrid snapGrid={[15, 15]} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}>
                <Controls />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                <SimulationControls nodes={nodes} edges={edges} />
              </ReactFlow>
            </div>
          </TabsContent>

          {activeTab === 'editor' && !isSimulating && !selectedNode && <NodePalette />}
          {selectedNode && activeTab === 'editor' && !isSimulating && (
            <PropertiesPanel node={selectedNode} onChange={onNodeDataChange} onClose={() => setSelectedNode(null)} onDelete={() => onNodesDelete([selectedNode])} />
          )}
        </div>
      </Tabs>
    </div>
  );
}

export default function FlowBuilder() {
  return (
    <ReactFlowProvider>
      <FlowBuilderNonContext />
    </ReactFlowProvider>
  );
}
