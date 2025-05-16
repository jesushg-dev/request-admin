'use client';

import type React from 'react';
import { useCallback, useRef } from 'react';

import type { ExecutionHistoryEntry, NodeSpecificStates, ProcessFlow } from '@/types/execution';

interface UseNodeActionsProps {
  processFlow: ProcessFlow | null;
  setNodeSpecificStates: React.Dispatch<React.SetStateAction<NodeSpecificStates>>;
  setExecutionHistory: React.Dispatch<React.SetStateAction<ExecutionHistoryEntry[]>>;
  advanceToNextNode: (outcome?: string) => void;
}

export function useNodeActions({ processFlow, setNodeSpecificStates, setExecutionHistory, advanceToNextNode }: UseNodeActionsProps) {
  // Referencia para los timers
  const timersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Limpiar timers cuando se desmonte el componente
  const cleanupTimers = useCallback(() => {
    Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
    timersRef.current = {};
  }, []);

  const handleTimerStart = useCallback(
    (nodeId: string) => {
      const node = processFlow?.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setNodeSpecificStates((prev) => ({
        ...prev,
        [nodeId]: {
          ...prev[nodeId],
          timer: {
            timeLeft: node.data.duration || 0,
            timerActive: true,
          },
        },
      }));

      // Actualizar el historial de ejecución
      setExecutionHistory((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          nodeId: nodeId,
          action: 'Temporizador iniciado',
          details: `Duración: ${node.data.duration} ${node.data.timeUnit}`,
        },
      ]);

      // Iniciar cuenta regresiva
      let timeLeft = node.data.duration || 0;

      const timerInterval = setInterval(() => {
        timeLeft--;

        setNodeSpecificStates((prev) => ({
          ...prev,
          [nodeId]: {
            ...prev[nodeId],
            timer: {
              timeLeft,
              timerActive: true,
            },
          },
        }));

        if (timeLeft <= 0) {
          clearInterval(timerInterval);

          // Avanzar automáticamente cuando el tiempo llegue a cero
          setTimeout(() => {
            advanceToNextNode();
          }, 500);
        }
      }, 1000);

      timersRef.current[nodeId] = timerInterval as unknown as NodeJS.Timeout;
    },
    [processFlow?.nodes, advanceToNextNode, setNodeSpecificStates, setExecutionHistory]
  );

  const handleTimerPause = useCallback(
    (nodeId: string) => {
      // Pausar el timer
      if (timersRef.current[nodeId]) {
        clearTimeout(timersRef.current[nodeId]);
      }

      setNodeSpecificStates((prev) => ({
        ...prev,
        [nodeId]: {
          ...prev[nodeId],
          timer: {
            ...(prev[nodeId]?.timer || { timeLeft: 0 }),
            timerActive: false,
          },
        },
      }));

      // Actualizar el historial de ejecución
      setExecutionHistory((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          nodeId: nodeId,
          action: 'Temporizador pausado',
          details: '',
        },
      ]);
    },
    [setNodeSpecificStates, setExecutionHistory]
  );

  const handleSendNotification = useCallback(
    (nodeId: string) => {
      setNodeSpecificStates((prev) => ({
        ...prev,
        [nodeId]: {
          ...prev[nodeId],
          notification: {
            status: 'sending',
          },
        },
      }));

      // Actualizar el historial de ejecución
      const node = processFlow?.nodes.find((n) => n.id === nodeId);
      setExecutionHistory((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          nodeId: nodeId,
          action: 'Enviando notificación',
          details: node ? `Canal: ${node.data.channel || 'email'}` : '',
        },
      ]);

      // Simular envío de notificación
      setTimeout(() => {
        // 90% de probabilidad de éxito
        if (Math.random() > 0.1) {
          setNodeSpecificStates((prev) => ({
            ...prev,
            [nodeId]: {
              ...prev[nodeId],
              notification: {
                status: 'success',
              },
            },
          }));

          // Actualizar el historial de ejecución
          setExecutionHistory((prev) => [
            ...prev,
            {
              timestamp: new Date(),
              nodeId: nodeId,
              action: 'Notificación enviada',
              details: 'Éxito',
            },
          ]);

          // Avanzar automáticamente después de éxito
          setTimeout(() => {
            advanceToNextNode();
          }, 1500);
        } else {
          setNodeSpecificStates((prev) => ({
            ...prev,
            [nodeId]: {
              ...prev[nodeId],
              notification: {
                status: 'error',
              },
            },
          }));

          // Actualizar el historial de ejecución
          setExecutionHistory((prev) => [
            ...prev,
            {
              timestamp: new Date(),
              nodeId: nodeId,
              action: 'Error en notificación',
              details: 'No se pudo enviar la notificación',
            },
          ]);
        }
      }, 2000);
    },
    [advanceToNextNode, processFlow?.nodes, setNodeSpecificStates, setExecutionHistory]
  );

  const handleExecuteTask = useCallback(
    (nodeId: string) => {
      setNodeSpecificStates((prev) => ({
        ...prev,
        [nodeId]: {
          ...prev[nodeId],
          task: {
            status: 'running',
          },
        },
      }));

      // Actualizar el historial de ejecución
      const node = processFlow?.nodes.find((n) => n.id === nodeId);
      setExecutionHistory((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          nodeId: nodeId,
          action: 'Ejecutando tarea',
          details: node ? `Tipo: ${node.data.type || 'manual'}` : '',
        },
      ]);

      // Simular ejecución de tarea
      setTimeout(() => {
        // 90% de probabilidad de éxito
        if (Math.random() > 0.1) {
          setNodeSpecificStates((prev) => ({
            ...prev,
            [nodeId]: {
              ...prev[nodeId],
              task: {
                status: 'success',
              },
            },
          }));

          // Actualizar el historial de ejecución
          setExecutionHistory((prev) => [
            ...prev,
            {
              timestamp: new Date(),
              nodeId: nodeId,
              action: 'Tarea completada',
              details: 'Éxito',
            },
          ]);

          // Avanzar automáticamente después de éxito
          setTimeout(() => {
            advanceToNextNode();
          }, 1500);
        } else {
          setNodeSpecificStates((prev) => ({
            ...prev,
            [nodeId]: {
              ...prev[nodeId],
              task: {
                status: 'error',
              },
            },
          }));

          // Actualizar el historial de ejecución
          setExecutionHistory((prev) => [
            ...prev,
            {
              timestamp: new Date(),
              nodeId: nodeId,
              action: 'Error en tarea',
              details: 'No se pudo completar la tarea',
            },
          ]);
        }
      }, 2000);
    },
    [advanceToNextNode, processFlow?.nodes, setNodeSpecificStates, setExecutionHistory]
  );

  const handleLoopContinue = useCallback(
    (nodeId: string) => {
      const node = processFlow?.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setNodeSpecificStates((prev) => {
        const currentCount = (prev[nodeId]?.loop?.count || 0) + 1;

        // Actualizar el historial de ejecución
        setExecutionHistory((prevHistory) => [
          ...prevHistory,
          {
            timestamp: new Date(),
            nodeId: nodeId,
            action: 'Iteración de bucle',
            details: `${currentCount} de ${node.data.maxIterations}`,
          },
        ]);

        // Si no hemos alcanzado el máximo, continuamos en el bucle
        if (currentCount < (node.data.maxIterations || 0)) {
          return {
            ...prev,
            [nodeId]: {
              ...prev[nodeId],
              loop: {
                count: currentCount,
              },
            },
          };
        } else {
          // Si alcanzamos el máximo, salimos del bucle
          setTimeout(() => {
            advanceToNextNode('error');
          }, 500);

          return {
            ...prev,
            [nodeId]: {
              ...prev[nodeId],
              loop: {
                count: currentCount,
              },
            },
          };
        }
      });
    },
    [processFlow?.nodes, advanceToNextNode, setNodeSpecificStates, setExecutionHistory]
  );

  return {
    timersRef,
    handleTimerStart,
    handleTimerPause,
    handleSendNotification,
    handleExecuteTask,
    handleLoopContinue,
    cleanupTimers,
  };
}
