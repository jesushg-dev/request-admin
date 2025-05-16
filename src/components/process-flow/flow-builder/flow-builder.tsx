'use client';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { AlertCircle, FileDown, FileUp, Maximize, Minimize, Play, Save, Trash2 } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';

import NodePalette from './node-palette';
import { AnnotationNode } from './nodes/annotation-node';
import { ApprovalNode } from './nodes/approval-node';
import { ConditionNode } from './nodes/condition-node';
import { EndNode } from './nodes/end-node';
import { GatewayNode } from './nodes/gateway-node';
import { LoopNode } from './nodes/loop-node';
import { MessageNode } from './nodes/message-node';
import { NotificationNode } from './nodes/notification-node';
import { StartNode } from './nodes/start-node';
import { StepNode } from './nodes/step-node';
import { SubprocessNode } from './nodes/subprocess-node';
import { TaskNode } from './nodes/task-node';
import { TimerNode } from './nodes/timer-node';
import PropertiesPanel from './properties-panel';
import SimulationControls from './simulation-controls';
import { validateFlow } from './validation';

// Definir interfaces para los datos de los nodos
interface NodeData {
  label: string;
  action?: string;
  responsible?: string;
  sla?: string;
  estimatedTime?: number;
  timeUnit?: string;
  expression?: string;
  condition?: string;
  maxIterations?: number;
  processRef?: string;
  type?: string;
  details?: string;
  approvers?: string[];
  channel?: string;
  message?: string;
  duration?: number;
  status?: string;
  isExecuting?: boolean;
  isCompleted?: boolean;
}

// Interfaz para el estado de ReactFlow
interface ReactFlowInstance {
  project: (position: { x: number; y: number }) => { x: number; y: number };
  toObject: () => FlowObject;
}

// Interfaz para el objeto de flujo
interface FlowObject {
  nodes: Node[];
  edges: Edge[];
}

interface ValidationError {
  nodeId?: string;
  message: string;
}

// Define custom node types
const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  step: StepNode,
  condition: ConditionNode,
  loop: LoopNode,
  subprocess: SubprocessNode,
  task: TaskNode,
  approval: ApprovalNode,
  notification: NotificationNode,
  timer: TimerNode,
  gateway: GatewayNode,
  message: MessageNode,
  annotation: AnnotationNode,
};

// Initial nodes and edges
const initialNodes = [
  {
    id: '1',
    type: 'start',
    position: { x: 250, y: 5 },
    data: { label: 'Start' },
  },
];

const initialEdges: Edge[] = [];

function FlowBuilderNonContext() {
  const reactFlow = useReactFlow();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle connections between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      // Create edge with animated style for loops
      const isLoop = params.source === params.target;
      const newEdge = {
        ...params,
        animated: isLoop,
        style: { stroke: isLoop ? '#ff0072' : '#555' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Handle drag over for the flow area
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop for new nodes
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlow.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create a new node based on the type
      const newNode: Node = {
        id: `${Date.now()}`,
        type,
        position,
        data: getDefaultDataForType(type),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Get default data for each node type
  const getDefaultDataForType = (type: string): NodeData => {
    switch (type) {
      case 'start':
        return { label: 'Inicio' };
      case 'end':
        return { label: 'Fin' };
      case 'step':
        return {
          label: 'Paso',
          action: '',
          responsible: '',
          sla: '',
          estimatedTime: 15,
          timeUnit: 'minutos',
        };
      case 'condition':
        return { label: 'Condición', expression: '' };
      case 'loop':
        return { label: 'Bucle', condition: '', maxIterations: 10 };
      case 'subprocess':
        return { label: 'Subproceso', processRef: '' };
      case 'task':
        return {
          label: 'Tarea',
          type: 'manual',
          details: '',
          estimatedTime: 20,
          timeUnit: 'minutos',
        };
      case 'approval':
        return {
          label: 'Aprobación',
          approvers: [],
          estimatedTime: 30,
          timeUnit: 'minutos',
        };
      case 'notification':
        return { label: 'Notificación', channel: 'email', message: '' };
      case 'timer':
        return { label: 'Temporizador', duration: 0, timeUnit: 'minutos' };
      case 'gateway':
        return { label: 'Gateway', type: 'parallel' };
      case 'message':
        return { label: 'Evento de Mensaje', message: '' };
      case 'annotation':
        return { label: 'Anotación', text: '' };
      default:
        return { label: type };
    }
  };

  // Handle node selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  // Handle click on edge
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge);
      setSelectedNode(null);
    },
    [setSelectedEdge]
  );

  // Handle node deletion
  const onNodesDelete = useCallback(
    (nodesToDelete: Node[]) => {
      // Eliminar los nodos seleccionados
      setNodes((nds) => nds.filter((node) => !nodesToDelete.some((n) => n.id === node.id)));

      // Eliminar las conexiones asociadas a los nodos eliminados
      setEdges((eds) => eds.filter((edge) => !nodesToDelete.some((node) => node.id === edge.source || node.id === edge.target)));

      // Si el nodo eliminado es el seleccionado, deseleccionarlo
      if (nodesToDelete.some((node) => node.id === selectedNode?.id)) {
        setSelectedNode(null);
      }
    },
    [selectedNode, setNodes, setEdges]
  );

  // Handle edge deletion
  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      setEdges((eds) => eds.filter((edge) => !edgesToDelete.some((e) => e.id === edge.id)));

      // Si el borde eliminado es el seleccionado, deseleccionarlo
      if (edgesToDelete.some((edge) => edge.id === selectedEdge?.id)) {
        setSelectedEdge(null);
      }
    },
    [selectedEdge, setEdges]
  );

  // Function to delete the selected edge
  const deleteSelectedEdge = useCallback(() => {
    if (selectedEdge) {
      onEdgesDelete([selectedEdge]);
    }
  }, [selectedEdge, onEdgesDelete]);

  // Handle node deselection
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  // Update node data when properties change
  const onNodeDataChange = useCallback(
    (nodeId: string, newData: NodeData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Actualizar la función handleValidateFlow
  const handleValidateFlow = useCallback(() => {
    const errors = validateFlow(nodes, edges);
    setValidationErrors(errors);

    if (errors.length === 0) {
      // Guardar el flujo completo para la vista de ejecución
      const processFlow = {
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type,
          data: node.data,
          position: node.position,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        })),
      };

      // Guardar en localStorage para que la vista de ejecución pueda acceder
      localStorage.setItem('itil-process-flow', JSON.stringify(processFlow));
      alert('¡Validación exitosa! Flujo listo para ejecuci��n.');
    }
  }, [nodes, edges]);

  // Save flow
  const handleSaveFlow = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      console.log('🚀 ~ handleSaveFlow ~ flow:', flow);
      localStorage.setItem('itil-flow', JSON.stringify(flow));
      alert('Flow saved successfully!');
    }
  }, [reactFlowInstance]);

  const handleLoadFlow = useCallback(() => {
    const savedFlow = localStorage.getItem('itil-flow');
    if (savedFlow) {
      const flow = JSON.parse(savedFlow) as FlowObject;
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
      alert('Flow loaded successfully!');
    }
  }, [setNodes, setEdges]);

  const handleExportFlow = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const dataStr = JSON.stringify(flow, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = 'itil-flow.json';

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  }, [reactFlowInstance]);

  // Toggle simulation mode
  const toggleSimulation = useCallback(() => {
    setIsSimulating(!isSimulating);
    setActiveTab(isSimulating ? 'editor' : 'simulation');
  }, [isSimulating]);

  // Detectar cambios en el estado de pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
        msFullscreenElement?: Element | null;
      };
      const isCurrentlyFullscreen = document.fullscreenElement !== null || doc.webkitFullscreenElement !== null || doc.msFullscreenElement !== null;

      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Implementación simplificada del botón de pantalla completa
  const handleFullscreenToggle = () => {
    if (
      !document.fullscreenElement &&
      !(document as Document & { webkitFullscreenElement?: Element | null }).webkitFullscreenElement &&
      !(document as Document & { msFullscreenElement?: Element | null }).msFullscreenElement
    ) {
      if (containerRef.current) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen().catch((err) => {
            alert(`Error al intentar mostrar pantalla completa: ${err.message}`);
          });
        } else if ((containerRef.current as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
          (containerRef.current as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen!();
        } else if ((containerRef.current as HTMLElement & { msRequestFullscreen?: () => void }).msRequestFullscreen) {
          (containerRef.current as HTMLElement & { msRequestFullscreen?: () => void }).msRequestFullscreen!();
        }
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          alert(`Error al intentar salir de pantalla completa: ${err.message}`);
        });
      } else if ((document as Document & { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
        (document as Document & { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen!();
      } else if ((document as Document & { msExitFullscreen?: () => Promise<void> }).msExitFullscreen) {
        (document as Document & { msExitFullscreen?: () => Promise<void> }).msExitFullscreen!();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden border rounded-md">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden" ref={containerRef}>
        <div className="flex border-b bg-background">
          <div className="flex items-center ml-auto gap-2 p-2">
            <Button type="button" variant="outline" size="sm" onClick={handleLoadFlow}>
              <FileUp className="w-4 h-4 mr-2" />
              Load
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleExportFlow}>
              <FileDown className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleValidateFlow}>
              Validate
            </Button>
            <Button type="button" variant={isSimulating ? 'destructive' : 'default'} size="sm" onClick={toggleSimulation}>
              <Play className="w-4 h-4 mr-2" />
              {isSimulating ? 'Stop Simulation' : 'Simulate'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleFullscreenToggle}>
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleSaveFlow}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
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
                onInit={setReactFlowInstance}
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
                snapGrid={[15, 15]}>
                <Controls />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                {selectedEdge && (
                  <Panel position="top-center" className="bg-white p-2 rounded shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        Conexión seleccionada: {selectedEdge.source} → {selectedEdge.target}
                      </span>
                      <Button type="button" variant="destructive" size="sm" onClick={deleteSelectedEdge}>
                        <Trash2 className="w-4 h-4 mr-1" /> Eliminar conexión
                      </Button>
                    </div>
                  </Panel>
                )}

                {validationErrors.length > 0 && (
                  <Panel position="bottom-center">
                    <Alert variant="destructive" className="mb-4 max-w-md">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Validation Errors</AlertTitle>
                      <AlertDescription>
                        <ul className="pl-5 list-disc">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error.message}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
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
