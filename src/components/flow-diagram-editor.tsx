'use client';

import { useCallback, useRef, useState } from 'react';
import { addEdge, Background, Controls, MarkerType, MiniMap, Panel, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState } from '@xyflow/react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

// Nodos iniciales para el diagrama
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Borrador' },
    position: { x: 250, y: 25 },
    style: { background: '#f3f4f6', color: '#111827', border: '1px solid #d1d5db' },
  },
  {
    id: '2',
    data: { label: 'En revisión' },
    position: { x: 250, y: 125 },
    style: { background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' },
  },
  {
    id: '3',
    data: { label: 'En progreso' },
    position: { x: 250, y: 225 },
    style: { background: '#bfdbfe', color: '#1e40af', border: '1px solid #60a5fa' },
  },
  {
    id: '4',
    type: 'output',
    data: { label: 'Cerrado' },
    position: { x: 250, y: 325 },
    style: { background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' },
  },
  {
    id: '5',
    type: 'output',
    data: { label: 'Cancelado' },
    position: { x: 450, y: 225 },
    style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
  },
];

// Conexiones iniciales para el diagrama
const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    label: 'Enviar',
    animated: true,
    style: { stroke: '#94a3b8' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#94a3b8',
    },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    label: 'Aprobar',
    animated: true,
    style: { stroke: '#94a3b8' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#94a3b8',
    },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    label: 'Completar',
    animated: true,
    style: { stroke: '#94a3b8' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#94a3b8',
    },
  },
  {
    id: 'e2-1',
    source: '2',
    target: '1',
    label: 'Devolver',
    animated: true,
    style: { stroke: '#94a3b8' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#94a3b8',
    },
  },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
    label: 'Cancelar',
    animated: true,
    style: { stroke: '#94a3b8' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#94a3b8',
    },
  },
];

// Colores disponibles para los nodos
const nodeColors = [
  { name: 'Gris', bg: '#f3f4f6', color: '#111827', border: '#d1d5db' },
  { name: 'Azul', bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  { name: 'Índigo', bg: '#bfdbfe', color: '#1e40af', border: '#60a5fa' },
  { name: 'Verde', bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  { name: 'Rojo', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  { name: 'Amarillo', bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
];

// Componente interno que contiene el diagrama
function FlowDiagramContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);
  const [nodeName, setNodeName] = useState('');
  const [nodeType, setNodeType] = useState('default');
  const [nodeColor, setNodeColor] = useState(0);
  const [edgeName, setEdgeName] = useState('');
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [isEditingEdge, setIsEditingEdge] = useState(false);

  // Manejar conexiones entre nodos
  const onConnect = useCallback(
    (params: any) => {
      // Crear un ID único para la nueva conexión
      const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        label: 'Nueva transición',
        animated: true,
        style: { stroke: '#94a3b8' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#94a3b8',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // Seleccionar la nueva conexión para editar
      setSelectedEdge(newEdge);
      setEdgeName('Nueva transición');
      setIsEditingEdge(true);
    },
    [setEdges]
  );

  // Manejar selección de nodos y conexiones
  const onSelectionChange = useCallback(({ nodes, edges }: { nodes: any[]; edges: any[] }) => {
    if (nodes.length === 1) {
      const node = nodes[0];
      setSelectedNode(node);
      setNodeName(node.data.label);
      setNodeType(node.type || 'default');

      // Encontrar el índice del color del nodo
      const colorIndex = nodeColors.findIndex((color) => color.bg === node.style?.background);
      setNodeColor(colorIndex >= 0 ? colorIndex : 0);

      setIsEditingNode(true);
      setIsEditingEdge(false);
      setSelectedEdge(null);
    } else if (edges.length === 1) {
      const edge = edges[0];
      setSelectedEdge(edge);
      setEdgeName(edge.label || '');
      setIsEditingEdge(true);
      setIsEditingNode(false);
      setSelectedNode(null);
    } else {
      setSelectedNode(null);
      setSelectedEdge(null);
      setIsEditingNode(false);
      setIsEditingEdge(false);
    }
  }, []);

  // Agregar un nuevo nodo
  const handleAddNode = () => {
    setIsAddingNode(true);
    setNodeName('Nuevo estado');
    setNodeType('default');
    setNodeColor(0);
    setIsEditingNode(true);
    setIsEditingEdge(false);
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  // Guardar un nodo (nuevo o editado)
  const handleSaveNode = () => {
    if (isAddingNode) {
      // Crear un nuevo nodo
      const newNode = {
        id: `${Date.now()}`,
        type: nodeType === 'initial' ? 'input' : nodeType === 'final' ? 'output' : undefined,
        data: { label: nodeName },
        position: { x: 250, y: 150 },
        style: {
          background: nodeColors[nodeColor].bg,
          color: nodeColors[nodeColor].color,
          border: `1px solid ${nodeColors[nodeColor].border}`,
        },
      };
      setNodes((nds) => [...nds, newNode]);
      toast.success('Estado agregado', {
        description: `El estado "${nodeName}" ha sido agregado al diagrama.`,
      });
    } else if (selectedNode) {
      // Actualizar nodo existente
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              type: nodeType === 'initial' ? 'input' : nodeType === 'final' ? 'output' : undefined,
              data: { ...node.data, label: nodeName },
              style: {
                background: nodeColors[nodeColor].bg,
                color: nodeColors[nodeColor].color,
                border: `1px solid ${nodeColors[nodeColor].border}`,
              },
            };
          }
          return node;
        })
      );
      toast.success('Estado actualizado', {
        description: `El estado ha sido actualizado correctamente.`,
      });
    }

    setIsAddingNode(false);
    setIsEditingNode(false);
    setSelectedNode(null);
  };

  // Eliminar un nodo
  const handleDeleteNode = () => {
    if (selectedNode) {
      // Eliminar el nodo
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));

      // Eliminar todas las conexiones asociadas a este nodo
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));

      toast.success('Estado eliminado', {
        description: `El estado "${selectedNode.data.label}" ha sido eliminado.`,
      });

      setIsEditingNode(false);
      setSelectedNode(null);
    }
  };

  // Guardar una conexión
  const handleSaveEdge = () => {
    if (selectedEdge) {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === selectedEdge.id) {
            return {
              ...edge,
              label: edgeName,
            };
          }
          return edge;
        })
      );

      toast.success('Transición actualizada', {
        description: `La transición ha sido actualizada correctamente.`,
      });

      setIsEditingEdge(false);
      setSelectedEdge(null);
    }
  };

  // Eliminar una conexión
  const handleDeleteEdge = () => {
    if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));

      toast.success('Transición eliminada', {
        description: `La transición ha sido eliminada correctamente.`,
      });

      setIsEditingEdge(false);
      setSelectedEdge(null);
    }
  };

  // Validar el diagrama
  const validateDiagram = () => {
    // Verificar que todos los nodos estén conectados
    const connectedNodes = new Set<string>();

    // Agregar todos los nodos que tienen conexiones
    edges.forEach((edge) => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    // Verificar si hay nodos sin conexiones
    const disconnectedNodes = nodes.filter((node) => !connectedNodes.has(node.id));

    if (disconnectedNodes.length > 0) {
      toast.error('Error de validación', {
        description: `Hay ${disconnectedNodes.length} estados sin conexiones. Todos los estados deben estar conectados.`,
      });
      return false;
    }

    // Verificar que haya al menos un nodo inicial y uno final
    const initialNodes = nodes.filter((node) => node.type === 'input');
    const finalNodes = nodes.filter((node) => node.type === 'output');

    if (initialNodes.length === 0) {
      toast.error('Error de validación', {
        description: 'Debe haber al menos un estado inicial en el flujo.',
      });
      return false;
    }

    if (finalNodes.length === 0) {
      toast.error('Error de validación', {
        description: 'Debe haber al menos un estado final en el flujo.',
      });
      return false;
    }

    // Verificar que desde cualquier nodo se pueda llegar a un nodo final
    // Implementación simplificada: verificar que cada nodo no final tenga al menos una salida
    const nonFinalNodesWithoutExits = nodes.filter((node) => node.type !== 'output').filter((node) => !edges.some((edge) => edge.source === node.id));

    if (nonFinalNodesWithoutExits.length > 0) {
      toast.error('Error de validación', {
        description: `Hay ${nonFinalNodesWithoutExits.length} estados no finales sin salidas. Todos los estados no finales deben tener al menos una transición de salida.`,
      });
      return false;
    }

    toast.success('Validación exitosa', {
      description: 'El flujo de trabajo es válido y cumple con todas las reglas de negocio.',
    });
    return true;
  };

  return (
    <div className="h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        fitView
        attributionPosition="bottom-left">
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />

        {/* Panel para agregar nodos */}
        <Panel position="top-right" className="flex gap-2">
          <Button size="sm" onClick={handleAddNode}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar estado
          </Button>
          <Button size="sm" onClick={validateDiagram} variant="outline">
            Validar diagrama
          </Button>
        </Panel>

        {/* Panel para editar nodos */}
        {isEditingNode && (
          <Panel position="top-left" className="bg-background border rounded-md p-4 shadow-md w-64">
            <h3 className="font-medium mb-2">{isAddingNode ? 'Agregar estado' : 'Editar estado'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre</label>
                <input type="text" value={nodeName} onChange={(e) => setNodeName(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tipo</label>
                <select value={nodeType} onChange={(e) => setNodeType(e.target.value)} className="w-full p-2 border rounded-md text-sm">
                  <option value="default">Normal</option>
                  <option value="initial">Inicial</option>
                  <option value="final">Final</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Color</label>
                <select value={nodeColor} onChange={(e) => setNodeColor(Number.parseInt(e.target.value))} className="w-full p-2 border rounded-md text-sm">
                  {nodeColors.map((color, index) => (
                    <option key={index} value={index}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between pt-2">
                {!isAddingNode && (
                  <Button variant="destructive" size="sm" onClick={handleDeleteNode}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                )}
                <Button size="sm" className="ml-auto" onClick={handleSaveNode}>
                  Guardar
                </Button>
              </div>
            </div>
          </Panel>
        )}

        {/* Panel para editar conexiones */}
        {isEditingEdge && (
          <Panel position="top-left" className="bg-background border rounded-md p-4 shadow-md w-64">
            <h3 className="font-medium mb-2">Editar transición</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre</label>
                <input type="text" value={edgeName} onChange={(e) => setEdgeName(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="destructive" size="sm" onClick={handleDeleteEdge}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
                <Button size="sm" onClick={handleSaveEdge}>
                  Guardar
                </Button>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

// Componente wrapper que proporciona el contexto de ReactFlow
export function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <div className="h-full w-full">
        <FlowDiagramContent />
      </div>
    </ReactFlowProvider>
  );
}
