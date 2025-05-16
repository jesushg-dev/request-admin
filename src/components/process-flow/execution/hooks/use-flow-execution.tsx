'use client';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { AvailableNode, ExecutionHistoryEntry, FlowEdge, FlowNode, NodeSpecificStates, ParallelGroups, PendingDecision, ProcessFlow } from '@/types/execution';

interface UseFlowExecutionProps {
  processFlow: ProcessFlow | null;
  nodes: FlowNode[];
  edges: FlowEdge[];
  currentNodeId: string | null;
  completedNodeIds: string[];
  nodeSpecificStates: NodeSpecificStates;
  executionHistory: ExecutionHistoryEntry[];
  currentLevel: number;
  setCurrentNodeId: React.Dispatch<React.SetStateAction<string | null>>;
  setCompletedNodeIds: React.Dispatch<React.SetStateAction<string[]>>;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  setIsComplete: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setPendingDecision: React.Dispatch<React.SetStateAction<PendingDecision | null>>;
  setExecutionHistory: React.Dispatch<React.SetStateAction<ExecutionHistoryEntry[]>>;
  setAvailableNodes: React.Dispatch<React.SetStateAction<AvailableNode[]>>;
  setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
  setTotalLevels: React.Dispatch<React.SetStateAction<number>>;
  setNodeSpecificStates: React.Dispatch<React.SetStateAction<NodeSpecificStates>>;
  setParallelGroups: React.Dispatch<React.SetStateAction<ParallelGroups>>;
  updateNodeStyles: (nodeList: FlowNode[], currentId: string | null, completedIds: string[]) => void;
  calculateLevelsAndAvailableNodes: (
    nodes: FlowNode[],
    edges: FlowEdge[],
    currentNodeId: string,
    completedNodeIds: string[],
    branch?: string,
    level?: number,
    parentId?: string
  ) => { levels: number; availableNodes: AvailableNode[] };
  timersRef: React.MutableRefObject<{ [key: string]: NodeJS.Timeout }>;
  initializeNodeSpecificStates: (nodes: FlowNode[]) => void;
  handleTimerStart: (nodeId: string) => void;
  handleTimerPause: (nodeId: string) => void;
  handleSendNotification: (nodeId: string) => void;
  handleExecuteTask: (nodeId: string) => void;
  handleLoopContinue: (nodeId: string) => void;
}

export function useFlowExecution({
  processFlow,
  nodes,
  edges,
  currentNodeId,
  completedNodeIds,
  nodeSpecificStates,
  executionHistory,
  currentLevel,
  setCurrentNodeId,
  setCompletedNodeIds,
  setProgress,
  setIsComplete,
  setIsPlaying,
  setPendingDecision,
  setExecutionHistory,
  setAvailableNodes,
  setCurrentLevel,
  setTotalLevels,
  setNodeSpecificStates,
  setParallelGroups,
  updateNodeStyles,
  calculateLevelsAndAvailableNodes,
  timersRef,
  initializeNodeSpecificStates,
  handleTimerStart,
  handleTimerPause,
  handleSendNotification,
  handleExecuteTask,
  handleLoopContinue,
}: UseFlowExecutionProps) {
  const [isPlayingInternal, setIsPlayingInternal] = useState(false);
  const [pendingDecisionInternal, setPendingDecisionInternal] = useState<PendingDecision | null>(null);
  const [isCompleteInternal, setIsCompleteInternal] = useState(false);

  // Usar useRef para todas las funciones interdependientes
  const advanceToNextNodeRef = useRef<(outcome?: string) => void>(() => {});
  const checkForDecisionRef = useRef<(node: FlowNode) => void>(() => {});
  const checkForAutomaticBehaviorRef = useRef<(node: FlowNode) => void>(() => {});
  const handleDecisionRef = useRef<(outcome: string) => void>(() => {});

  // Sincronizar estado interno con externo
  useEffect(() => {
    setIsPlaying(isPlayingInternal);
  }, [isPlayingInternal, setIsPlaying]);

  useEffect(() => {
    setIsComplete(isCompleteInternal);
  }, [isCompleteInternal, setIsComplete]);

  // Función para manejar múltiples salidas de un nodo (no de decisión)
  const handleMultipleOutputs = useCallback(
    (nodeId: string, completedNodeIds: string[]) => {
      if (!processFlow) return { nextNodeIds: [] as string[], updatedCompletedNodeIds: completedNodeIds };

      // Encontrar todas las conexiones salientes del nodo
      const outgoingEdges = processFlow.edges.filter((edge) => edge.source === nodeId);

      // Si no hay conexiones salientes, retornar
      if (outgoingEdges.length === 0) {
        return { nextNodeIds: [] as string[], updatedCompletedNodeIds: completedNodeIds };
      }

      // Obtener los IDs de los nodos siguientes
      const nextNodeIds = outgoingEdges.map((edge) => edge.target);

      // Actualizar el historial de ejecución
      const node = processFlow.nodes.find((n) => n.id === nodeId);
      if (node) {
        setExecutionHistory((prev) => [
          ...prev,
          {
            timestamp: new Date(),
            nodeId: nodeId,
            action: 'Activación de pasos paralelos',
            details: `Se activaron ${nextNodeIds.length} pasos desde ${node.data.label}`,
          },
        ]);
      }

      return { nextNodeIds, updatedCompletedNodeIds: completedNodeIds };
    },
    [processFlow, setExecutionHistory]
  );

  // Actualizar grupos paralelos
  const updateParallelGroups = useCallback(
    (currentNodeId: string, completedNodeIds: string[]) => {
      if (!processFlow) return;

      // Buscar nodos gateway paralelos
      const parallelGateways = processFlow.nodes.filter((node) => node.type === 'gateway' && node.data.type === 'parallel');

      const newParallelGroups: ParallelGroups = {};

      parallelGateways.forEach((gateway) => {
        // Encontrar todas las salidas del gateway
        const outgoingEdges = processFlow.edges.filter((edge) => edge.source === gateway.id);

        // Contar cuántas están completadas
        const totalPaths = outgoingEdges.length;
        const completedPaths = outgoingEdges.filter((edge) => completedNodeIds.includes(edge.target)).length;

        newParallelGroups[gateway.id] = {
          total: totalPaths,
          completed: completedPaths,
        };
      });

      setParallelGroups(newParallelGroups);
    },
    [processFlow, setParallelGroups]
  );

  // Verificar si un nodo requiere decisión - Definir primero como función independiente
  const checkForDecision = useCallback(
    (node: FlowNode) => {
      if (!processFlow) return;

      // Pausar la ejecución automática si se encuentra un nodo que requiere decisión
      setIsPlayingInternal(false);

      switch (node.type) {
        case 'condition':
          // Obtener las conexiones salientes
          const conditionEdges = processFlow.edges.filter((edge) => edge.source === node.id);
          const yesEdge = conditionEdges.find((edge) => edge.sourceHandle === 'yes');
          const noEdge = conditionEdges.find((edge) => edge.sourceHandle === 'no');

          // Encontrar los nodos destino
          const yesTarget = yesEdge ? processFlow.nodes.find((n) => n.id === yesEdge.target)?.data.label : 'Siguiente paso';
          const noTarget = noEdge ? processFlow.nodes.find((n) => n.id === noEdge.target)?.data.label : 'Siguiente paso';

          setPendingDecisionInternal({
            nodeId: node.id,
            type: 'condition',
            options: [
              { label: 'Sí', value: 'yes', target: yesTarget },
              { label: 'No', value: 'no', target: noTarget },
            ],
          });
          setPendingDecision({
            nodeId: node.id,
            type: 'condition',
            options: [
              { label: 'Sí', value: 'yes', target: yesTarget },
              { label: 'No', value: 'no', target: noTarget },
            ],
          });
          break;

        case 'approval':
          // Obtener las conexiones salientes
          const approvalEdges = processFlow.edges.filter((edge) => edge.source === node.id);
          const approveEdge = approvalEdges.find((edge) => edge.sourceHandle === 'approve');
          const rejectEdge = approvalEdges.find((edge) => edge.sourceHandle === 'reject');

          // Encontrar los nodos destino
          const approveTarget = approveEdge ? processFlow.nodes.find((n) => n.id === approveEdge.target)?.data.label : 'Siguiente paso';
          const rejectTarget = rejectEdge ? processFlow.nodes.find((n) => n.id === rejectEdge.target)?.data.label : 'Siguiente paso';

          setPendingDecisionInternal({
            nodeId: node.id,
            type: 'approval',
            options: [
              { label: 'Aprobar', value: 'approve', target: approveTarget },
              { label: 'Rechazar', value: 'reject', target: rejectTarget },
            ],
          });
          setPendingDecision({
            nodeId: node.id,
            type: 'approval',
            options: [
              { label: 'Aprobar', value: 'approve', target: approveTarget },
              { label: 'Rechazar', value: 'reject', target: rejectTarget },
            ],
          });
          break;

        case 'loop':
          // Obtener las conexiones salientes
          const loopEdges = processFlow.edges.filter((edge) => edge.source === node.id);
          const successEdge = loopEdges.find((edge) => edge.sourceHandle === 'success');
          const errorEdge = loopEdges.find((edge) => edge.sourceHandle === 'error');

          // Encontrar los nodos destino
          const successTarget = successEdge ? processFlow.nodes.find((n) => n.id === successEdge.target)?.data.label : 'Continuar bucle';
          const errorTarget = errorEdge ? processFlow.nodes.find((n) => n.id === errorEdge.target)?.data.label : 'Salir del bucle';

          setPendingDecisionInternal({
            nodeId: node.id,
            type: 'loop',
            options: [
              { label: 'Continuar bucle', value: 'success', target: successTarget },
              { label: 'Salir del bucle', value: 'error', target: errorTarget },
            ],
          });
          setPendingDecision({
            nodeId: node.id,
            type: 'loop',
            options: [
              { label: 'Continuar bucle', value: 'success', target: successTarget },
              { label: 'Salir del bucle', value: 'error', target: errorTarget },
            ],
          });
          break;

        case 'gateway':
          // Para gateways, mostrar todas las opciones de salida
          const gatewayEdges = processFlow.edges.filter((edge) => edge.source === node.id);
          const options = gatewayEdges.map((edge, index) => {
            const targetNode = processFlow.nodes.find((n) => n.id === edge.target);
            return {
              label: `Camino ${index + 1}: ${targetNode?.data.label || 'Desconocido'}`,
              value: edge.sourceHandle || `path_${index}`,
              target: targetNode?.data.label,
            };
          });

          setPendingDecisionInternal({
            nodeId: node.id,
            type: 'gateway',
            options,
          });
          setPendingDecision({
            nodeId: node.id,
            type: 'gateway',
            options,
          });
          break;

        default:
          // Para otros tipos de nodos, no se requiere decisión
          setPendingDecisionInternal(null);
          setPendingDecision(null);
          break;
      }
    },
    [processFlow, setPendingDecision, setIsPlayingInternal]
  );

  // Actualizar la referencia a checkForDecision
  useEffect(() => {
    checkForDecisionRef.current = checkForDecision;
  }, [checkForDecision]);

  // Verificar comportamientos automáticos - Definir como función independiente
  const checkForAutomaticBehavior = useCallback(
    (node: FlowNode) => {
      if (!node) return;

      // Comportamientos automáticos según el tipo de nodo
      switch (node.type) {
        case 'message':
          // Mostrar mensaje automáticamente
          setNodeSpecificStates((prev) => ({
            ...prev,
            [node.id]: {
              ...prev[node.id],
              message: { shown: true },
            },
          }));

          // Avanzar automáticamente después de mostrar el mensaje
          if (timersRef.current && node.id) {
            timersRef.current[node.id] = setTimeout(() => {
              advanceToNextNodeRef.current(); // Usar la referencia en lugar de la función directamente
            }, 3000);
          }
          break;

        case 'notification':
          // Intentar enviar notificación automáticamente
          handleSendNotification(node.id);
          break;

        case 'task':
          // Si es una tarea automática, ejecutarla
          if (node.data.type === 'automatic' || node.data.type === 'api') {
            handleExecuteTask(node.id);
          }
          break;

        case 'timer':
          // Iniciar temporizador automáticamente
          handleTimerStart(node.id);
          break;
      }
    },
    [setNodeSpecificStates, timersRef, handleSendNotification, handleExecuteTask, handleTimerStart]
  );

  // Actualizar la referencia a checkForAutomaticBehavior
  useEffect(() => {
    checkForAutomaticBehaviorRef.current = checkForAutomaticBehavior;
  }, [checkForAutomaticBehavior]);

  // Manejar decisión del usuario - Definir como función independiente
  const handleDecision = useCallback(
    (outcome: string) => {
      if (!processFlow) return;

      const pendingDecision = pendingDecisionInternal;
      if (pendingDecision) {
        // Actualizar el historial de ejecución
        const node = processFlow.nodes.find((n) => n.id === pendingDecision.nodeId);
        if (node) {
          const option = pendingDecision.options.find((opt) => opt.value === outcome);
          setExecutionHistory((prev) => [
            ...prev,
            {
              timestamp: new Date(),
              nodeId: pendingDecision.nodeId,
              action: `Decisión: ${option?.label || outcome}`,
              details: `En ${node.data.label}`,
            },
          ]);
        }

        advanceToNextNodeRef.current(outcome); // Usar la referencia en lugar de la función directamente
        setPendingDecisionInternal(null);
        setPendingDecision(null);

        // Reanudar la ejecución automática si estaba activa
        if (isPlayingInternal) {
          setTimeout(() => {
            const nextNode = processFlow.nodes.find((node) => node.id === currentNodeId);
            if (nextNode) {
              checkForDecisionRef.current(nextNode);
              checkForAutomaticBehaviorRef.current(nextNode);
            }
          }, 500);
        }
      }
    },
    [processFlow, isPlayingInternal, currentNodeId, setPendingDecision, setExecutionHistory, pendingDecisionInternal]
  );

  // Actualizar la referencia a handleDecision
  useEffect(() => {
    handleDecisionRef.current = handleDecision;
  }, [handleDecision]);

  // Avanzar al siguiente nodo - Definir después de las referencias
  const advanceToNextNode = useCallback(
    (outcome = 'default') => {
      if (!processFlow || !currentNodeId) return;

      // Añadir el nodo actual a los completados
      const newCompletedNodeIds = [...completedNodeIds, currentNodeId];
      setCompletedNodeIds(newCompletedNodeIds);

      // Encontrar el siguiente nodo basado en las conexiones
      const currentEdges = processFlow.edges.filter((edge) => edge.source === currentNodeId);
      const currentNode = processFlow.nodes.find((node) => node.id === currentNodeId);

      // Actualizar el historial de ejecución
      if (currentNode) {
        setExecutionHistory((prev) => [
          ...prev,
          {
            timestamp: new Date(),
            nodeId: currentNodeId,
            action: 'Completado',
            details: `${currentNode.type.charAt(0).toUpperCase() + currentNode.type.slice(1)}: ${currentNode.data.label}`,
          },
        ]);
      }

      // Si no hay conexiones salientes, el proceso ha terminado
      if (currentEdges.length === 0) {
        setCurrentNodeId(null);
        setProgress(100);
        setIsCompleteInternal(true);
        setIsPlayingInternal(false);
        updateNodeStyles(nodes, null, newCompletedNodeIds);
        return;
      }

      // Manejar nodos de step con múltiples salidas (no de decisión)
      if (currentNode?.type === 'step' && currentEdges.length > 1) {
        // Para steps con múltiples salidas, activar todos los nodos siguientes a la vez
        const { nextNodeIds, updatedCompletedNodeIds } = handleMultipleOutputs(currentNodeId, newCompletedNodeIds);

        if (nextNodeIds.length === 0) {
          // No hay nodos siguientes, el proceso ha terminado
          setCurrentNodeId(null);
          setProgress(100);
          setIsCompleteInternal(true);
          setIsPlayingInternal(false);
          updateNodeStyles(nodes, null, updatedCompletedNodeIds);
          return;
        }

        // Actualizar el progreso
        const totalNodes = processFlow.nodes.length;
        const newProgress = Math.round((updatedCompletedNodeIds.length / (totalNodes - 1)) * 100);
        setProgress(newProgress);

        // Actualizar estilos de los nodos
        updateNodeStyles(nodes, null, updatedCompletedNodeIds);

        // Recalcular niveles y nodos disponibles para todos los nodos siguientes
        let allAvailableNodes: AvailableNode[] = [];
        let maxLevel = currentLevel + 1; // Incrementar el nivel

        nextNodeIds.forEach((nodeId) => {
          const { levels, availableNodes } = calculateLevelsAndAvailableNodes(processFlow.nodes, processFlow.edges, nodeId, updatedCompletedNodeIds);
          maxLevel = Math.max(maxLevel, levels);
          allAvailableNodes = [...allAvailableNodes, ...availableNodes];
        });

        setTotalLevels(maxLevel);
        setAvailableNodes(allAvailableNodes);

        // Actualizar nivel actual al siguiente nivel
        setCurrentLevel(currentLevel + 1);

        // Actualizar grupos paralelos
        updateParallelGroups(currentNodeId, updatedCompletedNodeIds);

        // Activar todos los nodos siguientes
        nextNodeIds.forEach((nodeId) => {
          const node = processFlow.nodes.find((n) => n.id === nodeId);
          if (node) {
            // Verificar si el nodo requiere decisión o tiene comportamiento automático
            checkForDecisionRef.current(node);
            checkForAutomaticBehaviorRef.current(node);
          }
        });

        return;
      }

      // Si hay múltiples salidas, usar el outcome para determinar cuál seguir
      let nextEdge: FlowEdge | undefined;

      if (outcome !== 'default' && currentEdges.length > 1) {
        // Buscar la conexión específica basada en el sourceHandle
        nextEdge = currentEdges.find((edge) => edge.sourceHandle === outcome);
      }

      // Si no se encontró una conexión específica o no se especificó outcome, usar la primera
      if (!nextEdge) {
        nextEdge = currentEdges[0];
      }

      if (nextEdge) {
        const nextNodeId = nextEdge.target;
        const nextNode = processFlow.nodes.find((node) => node.id === nextNodeId);

        // Si el siguiente nodo es de tipo "end", marcar como completado automáticamente
        if (nextNode?.type === 'end') {
          setCurrentNodeId(nextNodeId);

          // Actualizar el progreso
          setProgress(100); // Marcar como 100% cuando llegamos al nodo de fin

          // Actualizar estilos de los nodos
          updateNodeStyles(nodes, nextNodeId, newCompletedNodeIds);

          // Marcar el proceso como completado
          setTimeout(() => {
            setCompletedNodeIds([...newCompletedNodeIds, nextNodeId]);
            setIsCompleteInternal(true);
            setIsPlayingInternal(false);
            updateNodeStyles(nodes, null, [...newCompletedNodeIds, nextNodeId]);

            // Actualizar el historial de ejecución
            setExecutionHistory((prev) => [
              ...prev,
              {
                timestamp: new Date(),
                nodeId: nextNodeId,
                action: 'Proceso completado',
                details: 'El flujo de proceso ha finalizado correctamente',
              },
            ]);
          }, 1000); // Pequeña pausa para mostrar el nodo de fin antes de completar

          return;
        }

        // Para otros tipos de nodos, comportamiento normal
        setCurrentNodeId(nextNodeId);

        // Actualizar el progreso
        const totalNodes = processFlow.nodes.length;
        const newProgress = Math.round((newCompletedNodeIds.length / (totalNodes - 1)) * 100);
        setProgress(newProgress);

        // Actualizar estilos de los nodos
        updateNodeStyles(nodes, nextNodeId, newCompletedNodeIds);

        // Recalcular niveles y nodos disponibles
        const { levels, availableNodes } = calculateLevelsAndAvailableNodes(processFlow.nodes, processFlow.edges, nextNodeId, newCompletedNodeIds);
        setTotalLevels(levels);
        setAvailableNodes(availableNodes);

        // Actualizar nivel actual
        const currentNodeLevel = availableNodes.find((n) => n.node.id === nextNodeId)?.level || currentLevel + 1;
        setCurrentLevel(currentNodeLevel);

        // Verificar si el siguiente nodo requiere decisión
        if (nextNode) {
          checkForDecisionRef.current(nextNode);
          checkForAutomaticBehaviorRef.current(nextNode);
        }

        // Actualizar grupos paralelos
        updateParallelGroups(nextNodeId, newCompletedNodeIds);
      } else {
        // No hay más nodos, el proceso ha terminado
        setCurrentNodeId(null);
        setProgress(100);
        setIsCompleteInternal(true);
        setIsPlayingInternal(false);
        updateNodeStyles(nodes, null, newCompletedNodeIds);
      }
    },
    [
      processFlow,
      currentNodeId,
      completedNodeIds,
      nodes,
      currentLevel,
      setCurrentNodeId,
      setCompletedNodeIds,
      setProgress,
      setExecutionHistory,
      updateNodeStyles,
      handleMultipleOutputs,
      setTotalLevels,
      setAvailableNodes,
      setCurrentLevel,
      updateParallelGroups,
      calculateLevelsAndAvailableNodes,
    ]
  );

  // Actualizar la referencia a advanceToNextNode
  useEffect(() => {
    advanceToNextNodeRef.current = advanceToNextNode;
  }, [advanceToNextNode]);

  // Reiniciar la ejecución
  const resetExecution = useCallback(() => {
    if (!processFlow) return;

    setIsPlayingInternal(false);
    setIsCompleteInternal(false);
    setCompletedNodeIds([]);
    setProgress(0);
    setPendingDecisionInternal(null);
    setPendingDecision(null);
    setExecutionHistory([]);

    // Limpiar todos los timers
    Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
    timersRef.current = {};

    // Reiniciar estados específicos
    initializeNodeSpecificStates(processFlow.nodes);

    // Reiniciar con el nodo de inicio
    const startNode = processFlow.nodes.find((node) => node.type === 'start');
    if (startNode) {
      setCurrentNodeId(startNode.id);
      updateNodeStyles(nodes, startNode.id, []);
      setCurrentLevel(1);

      // Recalcular niveles y nodos disponibles
      const { levels, availableNodes } = calculateLevelsAndAvailableNodes(processFlow.nodes, processFlow.edges, startNode.id, []);
      setTotalLevels(levels);
      setAvailableNodes(availableNodes);

      // Actualizar el historial de ejecución
      setExecutionHistory([
        {
          timestamp: new Date(),
          nodeId: startNode.id,
          action: 'Inicio del proceso',
          details: `${startNode.data.label}`,
        },
      ]);
    }
  }, [
    processFlow,
    nodes,
    setCompletedNodeIds,
    setProgress,
    setPendingDecision,
    setExecutionHistory,
    timersRef,
    initializeNodeSpecificStates,
    setCurrentNodeId,
    updateNodeStyles,
    setCurrentLevel,
    calculateLevelsAndAvailableNodes,
    setTotalLevels,
    setAvailableNodes,
  ]);

  // Modificar la función togglePlayPause para manejar el inicio automático
  const togglePlayPause = useCallback(() => {
    if (!processFlow) return;

    if (isCompleteInternal) {
      // Reiniciar la ejecución
      resetExecution();
      return;
    }

    setIsPlayingInternal(!isPlayingInternal);

    // Si estamos iniciando la ejecución, verificar si el nodo actual requiere decisión
    if (!isPlayingInternal) {
      const currentNode = processFlow.nodes.find((node) => node.id === currentNodeId);

      // Si el nodo actual es de tipo "start", avanzar automáticamente
      if (currentNode?.type === 'start') {
        advanceToNextNodeRef.current(); // Usar la referencia en lugar de la función directamente
      } else if (currentNode) {
        checkForDecisionRef.current(currentNode);
        checkForAutomaticBehaviorRef.current(currentNode);
      }
    }
  }, [processFlow, isPlayingInternal, currentNodeId, resetExecution, isCompleteInternal]);

  // Calcular tiempo total estimado
  const calculateTotalTime = useCallback(() => {
    if (!processFlow) return 0;

    let totalMinutes = 0;

    completedNodeIds.forEach((nodeId) => {
      const node = processFlow.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      if (node.data.estimatedTime) {
        let minutes = Number.parseInt(node.data.estimatedTime.toString());

        // Convertir a minutos según la unidad
        if (node.data.timeUnit === 'hours') {
          minutes *= 60;
        } else if (node.data.timeUnit === 'days') {
          minutes *= 1440; // 24 * 60
        }

        totalMinutes += minutes;
      } else if (node.type === 'timer' && node.data.duration) {
        let minutes = Number.parseInt(node.data.duration.toString());

        // Convertir a minutos según la unidad
        if (node.data.timeUnit === 'seconds') {
          minutes /= 60;
        } else if (node.data.timeUnit === 'hours') {
          minutes *= 60;
        } else if (node.data.timeUnit === 'days') {
          minutes *= 1440; // 24 * 60
        }

        totalMinutes += minutes;
      }
    });

    return totalMinutes;
  }, [processFlow, completedNodeIds]);

  // Exportar historial de ejecución
  const exportExecutionHistory = useCallback(() => {
    if (executionHistory.length === 0) return;

    // Crear CSV
    let csvContent = 'Fecha,Hora,Nodo,Acción,Detalles\n';

    executionHistory.forEach((entry) => {
      const date = entry.timestamp.toLocaleDateString();
      const time = entry.timestamp.toLocaleTimeString();
      const nodeId = entry.nodeId;
      const action = entry.action;
      const details = entry.details || '';

      // Escapar comas en los campos
      const escapedAction = action.includes(',') ? `"${action}"` : action;
      const escapedDetails = details.includes(',') ? `"${details}"` : details;

      csvContent += `${date},${time},${nodeId},${escapedAction},${escapedDetails}\n`;
    });

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `execution-history-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [executionHistory]);

  return {
    isPlaying: isPlayingInternal,
    advanceToNextNode,
    handleDecision,
    resetExecution,
    togglePlayPause,
    calculateTotalTime,
    exportExecutionHistory,
    checkForDecision,
    checkForAutomaticBehavior,
    updateParallelGroups,
  };
}
