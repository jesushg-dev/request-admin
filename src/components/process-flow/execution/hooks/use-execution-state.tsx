'use client';

import { useEffect, useRef, useState } from 'react';

import type { AvailableNode, ExecutionHistoryEntry, FlowEdge, FlowNode, NodeSpecificStates, ParallelGroups, PendingDecision, ProcessFlow } from '@/types/execution';

export function useExecutionState() {
  const [processFlow, setProcessFlow] = useState<ProcessFlow | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);
  const [availableNodes, setAvailableNodes] = useState<AvailableNode[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalLevels, setTotalLevels] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [showFullDiagram, setShowFullDiagram] = useState(false);
  const [nodeSpecificStates, setNodeSpecificStates] = useState<NodeSpecificStates>({});
  const [parallelGroups, setParallelGroups] = useState<ParallelGroups>({});
  const [activeTab, setActiveTab] = useState<string>('execution');
  const [slaWarnings, setSlaWarnings] = useState<{ [key: string]: boolean }>({});
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistoryEntry[]>([]);

  // Referencia para los timers
  const timersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Cargar el flujo del proceso
  useEffect(() => {
    const loadProcessFlow = () => {
      const savedFlow = localStorage.getItem('itil-process-flow');
      if (savedFlow) {
        try {
          const flow = JSON.parse(savedFlow) as ProcessFlow;
          setProcessFlow(flow);

          // Preparar nodos para la visualización
          const preparedNodes = flow.nodes.map((node: FlowNode) => ({
            ...node,
            // Añadir estilos para los nodos según su estado
            data: {
              ...node.data,
              isExecuting: false,
              isCompleted: false,
            },
          }));

          // Preparar bordes para la visualización
          const preparedEdges = flow.edges.map((edge: FlowEdge) => ({
            ...edge,
            // Añadir marcadores de flecha y etiquetas para los bordes
            markerEnd: {
              type: 'arrowclosed',
              width: 20,
              height: 20,
            },
            // Añadir etiquetas a los bordes según el sourceHandle
            label: getEdgeLabel(edge.sourceHandle),
            labelStyle: { fill: '#888', fontWeight: 500 },
            labelBgStyle: { fill: 'rgba(255, 255, 255, 0.8)' },
          }));

          setNodes(preparedNodes);
          setEdges(preparedEdges);

          // Inicializar con el nodo de inicio
          const startNode = flow.nodes.find((node: FlowNode) => node.type === 'start');
          if (startNode) {
            setCurrentNodeId(startNode.id);
            updateNodeStyles(preparedNodes, startNode.id, []);

            // Calcular niveles y nodos disponibles
            const { levels, availableNodes } = calculateLevelsAndAvailableNodes(flow.nodes, flow.edges, startNode.id, []);
            setTotalLevels(levels);
            setAvailableNodes(availableNodes);

            // Inicializar estados específicos para cada tipo de nodo
            initializeNodeSpecificStates(flow.nodes);
          }
        } catch (err) {
          setError('Error al cargar el flujo del proceso. Por favor, valide el flujo en el builder.');
        }
      } else {
        setError('No hay ningún flujo de proceso disponible. Por favor, cree y valide un flujo en el builder.');
      }
    };

    // Cargar el flujo cuando se monta el componente o cuando se cambia a la pestaña de ejecución
    loadProcessFlow();

    // Añadir un event listener para detectar cambios en el localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'itil-process-flow') {
        loadProcessFlow();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Crear un evento personalizado para comunicación entre pestañas
    const handleCustomEvent = () => {
      loadProcessFlow();
    };

    window.addEventListener('itil-flow-updated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('itil-flow-updated', handleCustomEvent);
      // Limpiar timers al desmontar
      Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, [activeTab]);

  // Obtener etiqueta para el borde según el sourceHandle
  const getEdgeLabel = (sourceHandle: string | undefined): string => {
    if (!sourceHandle) return '';

    switch (sourceHandle) {
      case 'yes':
        return 'Sí';
      case 'no':
        return 'No';
      case 'approve':
        return 'Aprobado';
      case 'reject':
        return 'Rechazado';
      case 'success':
        return 'Éxito';
      case 'error':
        return 'Error';
      default:
        return sourceHandle;
    }
  };

  // Inicializar estados específicos para cada tipo de nodo
  const initializeNodeSpecificStates = (nodes: FlowNode[]) => {
    const specificStates: NodeSpecificStates = {};

    nodes.forEach((node: FlowNode) => {
      specificStates[node.id] = {};

      if (node.type === 'timer') {
        specificStates[node.id].timer = {
          timeLeft: node.data.duration || 0,
          timerActive: false,
        };
      } else if (node.type === 'notification') {
        specificStates[node.id].notification = {
          status: 'idle',
        };
      } else if (node.type === 'task') {
        specificStates[node.id].task = {
          status: 'idle',
        };
      } else if (node.type === 'message') {
        specificStates[node.id].message = {
          shown: false,
        };
      } else if (node.type === 'loop') {
        specificStates[node.id].loop = {
          count: 0,
        };
      }
    });

    setNodeSpecificStates(specificStates);
  };

  // Actualizar estilos de los nodos según el estado
  const updateNodeStyles = (nodeList: FlowNode[], currentId: string | null, completedIds: string[]) => {
    const updatedNodes = nodeList.map((node) => {
      const isExecuting = node.id === currentId;
      const isCompleted = completedIds.includes(node.id);

      return {
        ...node,
        style: {
          ...node.style,
          boxShadow: isExecuting ? '0 0 0 2px #3b82f6' : isCompleted ? '0 0 0 2px #22c55e' : undefined,
        },
        data: {
          ...node.data,
          isExecuting,
          isCompleted,
        },
      };
    });

    setNodes(updatedNodes);
  };

  // Calcular niveles y nodos disponibles
  const calculateLevelsAndAvailableNodes = (
    nodes: FlowNode[],
    edges: FlowEdge[],
    currentNodeId: string,
    completedNodeIds: string[],
    branch = 'main',
    level = 1,
    parentId?: string
  ): { levels: number; availableNodes: AvailableNode[] } => {
    // Crear un mapa de dependencias para cada nodo
    const dependencyMap: { [key: string]: string[] } = {};
    edges.forEach((edge) => {
      if (!dependencyMap[edge.target]) {
        dependencyMap[edge.target] = [];
      }
      dependencyMap[edge.target].push(edge.source);
    });

    // Función para verificar si todas las dependencias están completadas
    const areDependenciesCompleted = (nodeId: string) => {
      const dependencies = dependencyMap[nodeId] || [];
      return dependencies.every((depId) => completedNodeIds.includes(depId));
    };

    // Encontrar nodos disponibles (sin dependencias o con dependencias completadas)
    const availableNodes: AvailableNode[] = [];
    let maxLevel = level;

    // Primero, añadir el nodo actual si no está completado
    const currentNode = nodes.find((node) => node.id === currentNodeId);
    if (currentNode && !completedNodeIds.includes(currentNodeId)) {
      availableNodes.push({
        node: currentNode,
        isActive: true,
        isCompleted: false,
        isBlocked: false,
        dependenciesCompleted: true,
        level,
        branch,
        parentId,
      });
    }

    // Luego, encontrar los siguientes nodos disponibles
    const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);

    // Si hay múltiples salidas, verificar si es un nodo de decisión
    if (outgoingEdges.length > 1) {
      const sourceNode = nodes.find((node) => node.id === currentNodeId);
      if (sourceNode && (sourceNode.type === 'condition' || sourceNode.type === 'approval' || sourceNode.type === 'gateway')) {
        // Para nodos de decisión, mostrar todas las opciones posibles
        outgoingEdges.forEach((edge) => {
          const targetNode = nodes.find((node) => node.id === edge.target);
          if (targetNode) {
            const newBranch = `${branch}-${edge.sourceHandle || 'default'}`;
            const isBlocked = !areDependenciesCompleted(edge.target);

            availableNodes.push({
              node: targetNode,
              isActive: false,
              isCompleted: completedNodeIds.includes(edge.target),
              isBlocked,
              dependenciesCompleted: !isBlocked,
              level: level + 1,
              branch: newBranch,
              parentId: currentNodeId,
            });
          }
        });
      } else {
        // Para nodos con múltiples salidas que no son de decisión (como paralelos)
        outgoingEdges.forEach((edge) => {
          const targetNode = nodes.find((node) => node.id === edge.target);
          if (targetNode) {
            const newBranch = `${branch}-${edge.sourceHandle || 'default'}`;
            const isBlocked = !areDependenciesCompleted(edge.target);

            availableNodes.push({
              node: targetNode,
              isActive: false,
              isCompleted: completedNodeIds.includes(edge.target),
              isBlocked,
              dependenciesCompleted: !isBlocked,
              level: level + 1,
              branch: newBranch,
              parentId: currentNodeId,
            });

            // Recursivamente añadir nodos disponibles en niveles más profundos
            if (!isBlocked && !completedNodeIds.includes(edge.target)) {
              const { levels, availableNodes: childNodes } = calculateLevelsAndAvailableNodes(nodes, edges, edge.target, completedNodeIds, newBranch, level + 1, currentNodeId);
              maxLevel = Math.max(maxLevel, levels);
              availableNodes.push(...childNodes);
            }
          }
        });
      }
    } else if (outgoingEdges.length === 1) {
      // Para nodos con una sola salida
      const edge = outgoingEdges[0];
      const targetNode = nodes.find((node) => node.id === edge.target);
      if (targetNode) {
        const isBlocked = !areDependenciesCompleted(edge.target);

        availableNodes.push({
          node: targetNode,
          isActive: false,
          isCompleted: completedNodeIds.includes(edge.target),
          isBlocked,
          dependenciesCompleted: !isBlocked,
          level: level + 1,
          branch,
          parentId: currentNodeId,
        });

        // Recursivamente añadir nodos disponibles en niveles más profundos
        if (!isBlocked && !completedNodeIds.includes(edge.target)) {
          const { levels, availableNodes: childNodes } = calculateLevelsAndAvailableNodes(nodes, edges, edge.target, completedNodeIds, branch, level + 1, currentNodeId);
          maxLevel = Math.max(maxLevel, levels);
          availableNodes.push(...childNodes);
        }
      }
    }

    return { levels: maxLevel, availableNodes };
  };

  return {
    processFlow,
    nodes,
    edges,
    currentNodeId,
    completedNodeIds,
    availableNodes,
    progress,
    currentLevel,
    totalLevels,
    error,
    isPlaying,
    isComplete,
    pendingDecision,
    selectedNode,
    showFullDiagram,
    nodeSpecificStates,
    parallelGroups,
    activeTab,
    slaWarnings,
    executionHistory,
    timersRef,
    setProcessFlow,
    setNodes,
    setEdges,
    setCurrentNodeId,
    setCompletedNodeIds,
    setAvailableNodes,
    setProgress,
    setCurrentLevel,
    setTotalLevels,
    setError,
    setIsPlaying,
    setIsComplete,
    setPendingDecision,
    setSelectedNode,
    setShowFullDiagram,
    setNodeSpecificStates,
    setParallelGroups,
    setActiveTab,
    setSlaWarnings,
    setExecutionHistory,
    updateNodeStyles,
    calculateLevelsAndAvailableNodes,
    initializeNodeSpecificStates,
    getEdgeLabel,
  };
}
