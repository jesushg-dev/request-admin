import { useCallback } from 'react';

import type { ExecutionHistoryEntry, LoopNodeType, NodeSpecificStates, NotificationNodeType, TaskNodeType, TimerNodeType } from '@/types/execution-flow';

import { useExecutionContext } from '../execution-context';

export function useNodeActions() {
  const { state, dispatch, timersRef } = useExecutionContext();
  const { processFlow, nodeSpecificStates, executionHistory } = state;

  // Clear all timers on unmount
  const cleanupTimers = useCallback(() => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
  }, [timersRef]);

  // Start a timer node
  const handleTimerStart = useCallback(
    (nodeId: string) => {
      const node = processFlow?.nodes.find((n): n is TimerNodeType => n.id === nodeId && n.type === 'timer');
      if (!node) return;

      // Update node-specific state
      const newStates = {
        ...nodeSpecificStates,
        [nodeId]: {
          ...nodeSpecificStates[nodeId],
          timer: { timeLeft: node.data.duration, timerActive: true },
        },
      };
      dispatch({ type: 'SET_NODE_SPECIFIC_STATES', payload: newStates });

      // Log history
      const entry: ExecutionHistoryEntry = {
        nodeId,
        timestamp: new Date(),
        action: 'Timer started',
        details: `Duration: ${node.data.duration} ${node.data.timeUnit}`,
      };
      dispatch({ type: 'SET_EXECUTION_HISTORY', payload: [...executionHistory, entry] });

      // Begin countdown
      let timeLeft = node.data.duration;
      const interval = setInterval(() => {
        timeLeft--;
        const updatedStates = {
          ...nodeSpecificStates,
          [nodeId]: {
            ...nodeSpecificStates[nodeId],
            timer: { timeLeft, timerActive: true },
          },
        };
        dispatch({ type: 'SET_NODE_SPECIFIC_STATES', payload: updatedStates });

        if (timeLeft <= 0) {
          clearInterval(interval);
          setTimeout(() => dispatch({ type: 'SET_CURRENT_NODE_ID', payload: null }), 500);
        }
      }, 1000);

      timersRef.current[nodeId] = interval as unknown as NodeJS.Timeout;
    },
    [processFlow, nodeSpecificStates, executionHistory, dispatch]
  );

  // Pause a timer node
  const handleTimerPause = useCallback(
    (nodeId: string) => {
      if (timersRef.current[nodeId]) {
        clearTimeout(timersRef.current[nodeId]);
      }
      const updatedStates = {
        ...nodeSpecificStates,
        [nodeId]: {
          ...nodeSpecificStates[nodeId],
          timer: {
            ...nodeSpecificStates[nodeId].timer,
            timerActive: false,
          },
        },
      } as NodeSpecificStates;
      const entry: ExecutionHistoryEntry = { nodeId, timestamp: new Date(), action: 'Timer paused', details: '' };
      dispatch({ type: 'SET_NODE_SPECIFIC_STATES', payload: updatedStates });
      dispatch({ type: 'SET_EXECUTION_HISTORY', payload: [...executionHistory, entry] });
    },
    [nodeSpecificStates, executionHistory, dispatch]
  );

  // Send a notification node
  const handleSendNotification = useCallback(
    (nodeId: string) => {
      const node = processFlow?.nodes.find((n): n is NotificationNodeType => n.id === nodeId && n.type === 'notification');
      if (!node) return;

      dispatch({
        type: 'SET_NODE_SPECIFIC_STATES',
        payload: {
          ...nodeSpecificStates,
          [nodeId]: { ...nodeSpecificStates[nodeId], notification: { status: 'sending' } },
        },
      });

      const startEntry: ExecutionHistoryEntry = {
        nodeId,
        timestamp: new Date(),
        action: 'Sending notification',
        details: `Channel: ${node.data.channel}`,
      };
      dispatch({ type: 'SET_EXECUTION_HISTORY', payload: [...executionHistory, startEntry] });

      setTimeout(() => {
        const success = Math.random() > 0.1;
        dispatch({
          type: 'SET_NODE_SPECIFIC_STATES',
          payload: {
            ...nodeSpecificStates,
            [nodeId]: {
              ...nodeSpecificStates[nodeId],
              notification: { status: success ? 'success' : 'error' },
            },
          },
        });

        const resultEntry: ExecutionHistoryEntry = {
          nodeId,
          timestamp: new Date(),
          action: success ? 'Notification sent' : 'Notification error',
          details: success ? 'Success' : 'Failed to send notification',
        };
        dispatch({ type: 'SET_EXECUTION_HISTORY', payload: [...executionHistory, resultEntry] });

        if (success) {
          setTimeout(() => dispatch({ type: 'SET_CURRENT_NODE_ID', payload: null }), 1500);
        }
      }, 2000);
    },
    [processFlow, nodeSpecificStates, executionHistory, dispatch]
  );

  // Execute a task node
  const handleExecuteTask = useCallback(
    (nodeId: string) => {
      const node = processFlow?.nodes.find((n): n is TaskNodeType => n.id === nodeId && n.type === 'task');
      if (!node) return;

      dispatch({
        type: 'SET_NODE_SPECIFIC_STATES',
        payload: {
          ...nodeSpecificStates,
          [nodeId]: { ...nodeSpecificStates[nodeId], task: { status: 'running' } },
        },
      });

      const startEntry: ExecutionHistoryEntry = {
        nodeId,
        timestamp: new Date(),
        action: 'Executing task',
        details: `Type: ${node.data.type}`,
      };
      dispatch({ type: 'SET_EXECUTION_HISTORY', payload: [...executionHistory, startEntry] });

      setTimeout(() => {
        const success = Math.random() > 0.1;
        dispatch({
          type: 'SET_NODE_SPECIFIC_STATES',
          payload: {
            ...nodeSpecificStates,
            [nodeId]: { ...nodeSpecificStates[nodeId], task: { status: success ? 'success' : 'error' } },
          },
        });

        const resultEntry: ExecutionHistoryEntry = {
          nodeId,
          timestamp: new Date(),
          action: success ? 'Task completed' : 'Task error',
          details: success ? 'Success' : 'Failed to complete task',
        };
        dispatch({ type: 'SET_EXECUTION_HISTORY', payload: [...executionHistory, resultEntry] });

        if (success) {
          setTimeout(() => dispatch({ type: 'SET_CURRENT_NODE_ID', payload: null }), 1500);
        }
      }, 2000);
    },
    [processFlow, nodeSpecificStates, executionHistory, dispatch]
  );

  // Continue a loop node
  const handleLoopContinue = useCallback(
    (nodeId: string) => {
      const node = processFlow?.nodes.find((n): n is LoopNodeType => n.id === nodeId && n.type === 'loop');
      if (!node) return;

      const currentCount = (nodeSpecificStates[nodeId]?.loop?.count || 0) + 1;
      const entry: ExecutionHistoryEntry = {
        nodeId,
        timestamp: new Date(),
        action: 'Loop iteration',
        details: `${currentCount} of ${node.data.maxIterations}`,
      };

      const updatedStates = {
        ...nodeSpecificStates,
        [nodeId]: { ...nodeSpecificStates[nodeId], loop: { count: currentCount } },
      };
      dispatch({ type: 'SET_NODE_SPECIFIC_STATES', payload: updatedStates });
      dispatch({ type: 'SET_EXECUTION_HISTORY', payload: [...executionHistory, entry] });

      if (currentCount >= node.data.maxIterations) {
        setTimeout(() => dispatch({ type: 'SET_CURRENT_NODE_ID', payload: 'error' }), 500);
      }
    },
    [processFlow, nodeSpecificStates, executionHistory, dispatch]
  );

  return { timersRef, cleanupTimers, handleTimerStart, handleTimerPause, handleSendNotification, handleExecuteTask, handleLoopContinue };
}
