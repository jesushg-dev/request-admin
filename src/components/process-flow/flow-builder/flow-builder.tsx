'use client';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ExecutionFlowValues } from '@/services/schemas/execution-flow';
import type { Connection } from '@xyflow/react';
import { addEdge, Background, BackgroundVariant, Controls, MarkerType, Panel, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react';
import { Locale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

import type { FlowEdge, FlowNode, FlowNodeType, NodeData, ProcessFlow } from '@/types/execution-flow';
import { getDefaultDataForType, isValidNodeType } from '@/lib/execution-flow';
import { generateUuid } from '@/lib/id';
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

const getDefaultNodes: () => FlowNode[] = () => [
  {
    id: generateUuid(),
    type: 'start',
    position: { x: 250, y: 5 },
    data: { label: 'Start' } as NodeData<'start'>,
  },
];

const initialEdges: FlowEdge[] = [];

interface FlowBuilderProps {
  locale: Locale;
  value?: ExecutionFlowValues | null;
  onSave: (flow: ExecutionFlowValues) => void;
}

function FlowBuilderNonContext({ onSave, value, locale }: FlowBuilderProps) {
  const t = useTranslations('component.flowExecution.build');
  const theme = useTheme();
  const reactFlow = useReactFlow<FlowNode, FlowEdge>();
  const { validateFlow } = useValidationFlow();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { ref: containerRef, isFullscreen, toggleFullscreen: handleFullscreenToggle } = useFullscreen<HTMLDivElement>();

  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<FlowEdge | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(getDefaultNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>(initialEdges);

  const [activeTab, setActiveTab] = useState('editor');
  const [isValidationErrorVisible, setIsValidationErrorVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const onConnect = useCallback(
    (params: Connection) => {
      const isLoop = params.source === params.target;
      const newEdge: FlowEdge = {
        ...params,
        id: generateUuid(),
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
        id: generateUuid(),
        type,
        position,
        data: getDefaultDataForType(type, locale),
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

  const handleLoadFlow = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string) as ProcessFlow;
          if (json.nodes && json.edges) {
            // 1. Generate new Ids for nodes and create a map of oldId -> newId
            const idMap = new Map<string, string>();
            const newNodes = json.nodes.map((node) => {
              const newId = generateUuid();
              idMap.set(node.id, newId);
              return { ...node, id: newId };
            });

            // 2. Update the edges using the ID map
            const newEdges = json.edges.map((edge) => ({
              ...edge,
              id: generateUuid(),
              source: idMap.get(edge.source) || edge.source,
              target: idMap.get(edge.target) || edge.target,
            }));

            setNodes(newNodes);
            setEdges(newEdges);
          } else {
            toast.error(t('validation.invalidFlow'));
          }
        } catch {
          toast.error(t('validation.invalidJson'));
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    [t, setNodes, setEdges]
  );

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
    setActiveTab((prev) => (prev === 'editor' ? 'simulation' : 'editor'));
  }, []);

  const handleSaveFlow = useCallback(() => {
    setActiveTab('editor');
    const errors = validateFlow(nodes, edges);
    setValidationErrors(errors);
    setIsValidationErrorVisible(errors.length > 0);

    if (reactFlow && errors.length === 0) {
      const flow = reactFlow.toObject();
      onSave(flow as ExecutionFlowValues);
      toast.success(t('hint.saveSuccess'));
    }
  }, [nodes, edges, validateFlow, reactFlow, onSave]);

  useEffect(() => {
    setNodes((value?.nodes as FlowNode[]) ?? getDefaultNodes());
    setEdges((value?.edges as FlowEdge[]) ?? initialEdges);
    setActiveTab('editor');
    setSelectedNode(null);
    setSelectedEdge(null);
    setValidationErrors([]);
    setIsValidationErrorVisible(false);
  }, [value, setNodes, setEdges]);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden border rounded-md">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden" ref={containerRef}>
        <div className="flex border-b bg-background w-full gap-4 justify-between items-center p-2">
          <AlertBanner title={t('hint.save')} variant="info" />
          <FlowBuilderControls
            isFullscreen={isFullscreen}
            isSimulating={activeTab === 'simulation'}
            handleLoadFlow={handleLoadFlow}
            handleExportFlow={handleExportFlow}
            toggleSimulation={toggleSimulation}
            handleFullscreenToggle={handleFullscreenToggle}
            handleSaveFlow={handleSaveFlow}
          />
          <input type="file" className="hidden" accept="application/json" ref={fileInputRef} onChange={handleFileChange} aria-label={t('ariaLabel.loadFlow')} />
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
                      visible={isValidationErrorVisible}
                      onClose={() => setIsValidationErrorVisible(false)}
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

          {activeTab === 'editor' && !selectedNode && <NodePalette />}
          {selectedNode && activeTab === 'editor' && (
            <PropertiesPanel node={selectedNode} onChange={onNodeDataChange} onClose={() => setSelectedNode(null)} onDelete={() => onNodesDelete([selectedNode])} />
          )}
        </div>
      </Tabs>
    </div>
  );
}

export default function FlowBuilder(props: FlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <FlowBuilderNonContext {...props} />
    </ReactFlowProvider>
  );
}
