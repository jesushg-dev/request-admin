import { useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

import type { AvailableNode, ExecutionHistoryEntry, FlowEdge, FlowNode, NodeSpecificStates, ParallelGroups, PendingDecision } from '@/types/execution-flow';
import { isValidNodeType } from '@/lib/execution-flow';

import { useExecutionContext } from '../execution-context';

interface UseFlowExecutionProps {
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
  initializeNodeSpecificStates: (nodes: FlowNode[]) => void;
  handleTimerStart: (nodeId: string) => void;
  handleTimerPause: (nodeId: string) => void;
  handleSendNotification: (nodeId: string) => void;
  handleExecuteTask: (nodeId: string) => void;
  handleLoopContinue: (nodeId: string) => void;
}

export function useFlowExecution({
  updateNodeStyles,
  calculateLevelsAndAvailableNodes,
  initializeNodeSpecificStates,
  handleTimerStart,
  handleSendNotification,
  handleExecuteTask,
}: UseFlowExecutionProps) {
  const t = useTranslations('component.flowExecution.execution');
  const { state, dispatch, timersRef } = useExecutionContext();
  const { processFlow, currentNodeId, completedNodeIds, nodes, currentLevel, executionHistory, isPlaying, isComplete, pendingDecision } = state;

  // Ref to keep the functions updated
  const advanceToNextNodeRef = useRef<(outcome?: string) => void>(() => {});
  const checkForDecisionRef = useRef<(node: FlowNode) => void>(() => {});
  const checkForAutomaticBehaviorRef = useRef<(node: FlowNode) => void>(() => {});
  const handleDecisionRef = useRef<(outcome: string) => void>(() => {});

  // Common actions
  const setCurrentNodeId = useCallback((id: string | null) => dispatch({ type: 'SET_CURRENT_NODE_ID', payload: id }), [dispatch]);
  const setCompletedNodeIds = useCallback((ids: string[]) => dispatch({ type: 'SET_COMPLETED_NODES', payload: ids }), [dispatch]);
  const setProgress = useCallback((value: number) => dispatch({ type: 'SET_PROGRESS', payload: value }), [dispatch]);
  const setExecutionHistory = useCallback((history: ExecutionHistoryEntry[]) => dispatch({ type: 'SET_EXECUTION_HISTORY', payload: history }), [dispatch]);
  const setParallelGroups = useCallback((groups: ParallelGroups) => dispatch({ type: 'SET_PARALLEL_GROUPS', payload: groups }), [dispatch]);
  const setPendingDecision = useCallback((decision: PendingDecision | null) => dispatch({ type: 'SET_PENDING_DECISION', payload: decision }), [dispatch]);
  const setAvailableNodes = useCallback((nodes: AvailableNode[]) => dispatch({ type: 'SET_AVAILABLE_NODES', payload: nodes }), [dispatch]);
  const setTotalLevels = useCallback((levels: number) => dispatch({ type: 'SET_LEVELS', payload: { current: currentLevel, total: levels } }), [dispatch, currentLevel]);
  const setCurrentLevel = useCallback((level: number) => dispatch({ type: 'SET_LEVELS', payload: { current: level, total: state.totalLevels } }), [dispatch, state.totalLevels]);
  const setNodeSpecificStates = useCallback((states: NodeSpecificStates) => dispatch({ type: 'SET_NODE_SPECIFIC_STATES', payload: states }), [dispatch]);

  const handleMultipleOutputs = useCallback(
    (nodeId: string) => {
      if (!processFlow) return { nextNodeIds: [] as string[] };

      const outgoingEdges = processFlow.edges.filter((edge) => edge.source === nodeId);
      if (outgoingEdges.length === 0) return { nextNodeIds: [] as string[] };

      const nextNodeIds = outgoingEdges.map((edge) => edge.target);
      const node = processFlow.nodes.find((n) => n.id === nodeId);

      if (node) {
        setExecutionHistory([
          ...executionHistory,
          {
            timestamp: new Date(),
            nodeId: nodeId,
            action: t('history.parallelStepsActivation'),
            details: t('history.parallelStepsActivationDetails', { count: nextNodeIds.length, label: node.data.label }),
          },
        ]);
      }

      return { nextNodeIds };
    },
    [processFlow, executionHistory, setExecutionHistory, t]
  );

  const updateParallelGroups = useCallback(() => {
    if (!processFlow) return;

    const newParallelGroups: ParallelGroups = {};
    const parallelGateways = processFlow.nodes.filter((node) => node.type === 'gateway' && node.data.type === 'parallel');

    parallelGateways.forEach((gateway) => {
      const outgoingEdges = processFlow.edges.filter((edge) => edge.source === gateway.id);
      newParallelGroups[gateway.id] = {
        total: outgoingEdges.length,
        completed: outgoingEdges.filter((edge) => completedNodeIds.includes(edge.target)).length,
      };
    });

    setParallelGroups(newParallelGroups);
  }, [processFlow, completedNodeIds, setParallelGroups]);

  const checkForDecision = useCallback(
    (node: FlowNode) => {
      if (!processFlow) return;

      dispatch({ type: 'SET_PLAYING', payload: false });

      const getDecisionOptions = () => {
        const edges = processFlow.edges.filter((edge) => edge.source === node.id);

        switch (node.type) {
          case 'condition':
            return [
              { label: t('decision.yes'), value: 'yes', target: edges.find((e) => e.sourceHandle === 'yes')?.target },
              { label: t('decision.no'), value: 'no', target: edges.find((e) => e.sourceHandle === 'no')?.target },
            ];
          case 'approval':
            return [
              { label: t('decision.approve'), value: 'approve', target: edges.find((e) => e.sourceHandle === 'approve')?.target },
              { label: t('decision.reject'), value: 'reject', target: edges.find((e) => e.sourceHandle === 'reject')?.target },
            ];
          case 'loop':
            return [
              { label: t('decision.continueLoop'), value: 'success', target: edges.find((e) => e.sourceHandle === 'success')?.target },
              { label: t('decision.exitLoop'), value: 'error', target: edges.find((e) => e.sourceHandle === 'error')?.target },
            ];
          case 'gateway':
            return edges.map((edge, index) => ({
              label: t('decision.path', { number: index + 1, label: processFlow.nodes.find((n) => n.id === edge.target)?.data.label || t('decision.unknown') }),
              value: edge.sourceHandle || `path_${index}`,
              target: edge.target,
            }));
          default:
            return [];
        }
      };

      const options = getDecisionOptions().map((opt) => ({
        ...opt,
        target: processFlow.nodes.find((n) => n.id === opt.target)?.data.label || t('decision.nextStep'),
      }));

      setPendingDecision(
        node.type === 'gateway'
          ? {
              nodeId: node.id,
              type: node.type,
              options,
            }
          : {
              nodeId: node.id,
              type: node.type as 'condition' | 'approval' | 'loop',
              options,
            }
      );
    },
    [processFlow, setPendingDecision, dispatch, t]
  );

  const checkForAutomaticBehavior = useCallback(
    (node: FlowNode) => {
      if (!node) return;

      const updateStates = (update: Partial<NodeSpecificStates[typeof node.id]>) => {
        setNodeSpecificStates({
          ...state.nodeSpecificStates,
          [node.id]: {
            ...state.nodeSpecificStates[node.id],
            ...update,
          },
        });
      };

      switch (node.type) {
        case 'message':
          updateStates({ message: { shown: true } });
          timersRef.current[node.id] = setTimeout(() => advanceToNextNodeRef.current(), 3000);
          break;
        case 'notification':
          handleSendNotification(node.id);
          break;
        case 'task':
          if (node.data.type === 'automatic' || node.data.type === 'api') handleExecuteTask(node.id);
          break;
        case 'timer':
          handleTimerStart(node.id);
          break;
      }
    },
    [state.nodeSpecificStates, setNodeSpecificStates, timersRef, handleSendNotification, handleExecuteTask, handleTimerStart]
  );

  const handleDecision = useCallback(
    (outcome: string) => {
      if (!processFlow || !pendingDecision) return;

      const node = processFlow.nodes.find((n) => n.id === pendingDecision.nodeId);
      if (node) {
        setExecutionHistory([
          ...executionHistory,
          {
            timestamp: new Date(),
            nodeId: pendingDecision.nodeId,
            action: t('history.decision', { decision: pendingDecision.options.find((opt) => opt.value === outcome)?.label || outcome }),
            details: t('history.decisionDetails', { label: node.data.label }),
          },
        ]);
      }

      advanceToNextNodeRef.current(outcome);
      setPendingDecision(null);

      if (isPlaying) {
        setTimeout(() => {
          const nextNode = processFlow.nodes.find((n) => n.id === currentNodeId);
          if (nextNode) {
            checkForDecisionRef.current(nextNode);
            checkForAutomaticBehaviorRef.current(nextNode);
          }
        }, 500);
      }
    },
    [processFlow, pendingDecision, executionHistory, setExecutionHistory, setPendingDecision, isPlaying, currentNodeId, t]
  );

  const advanceToNextNode = useCallback(
    (outcome = 'default') => {
      if (!processFlow || !currentNodeId) return;

      const newCompletedNodeIds = [...completedNodeIds, currentNodeId];
      setCompletedNodeIds(newCompletedNodeIds);

      const currentEdges = processFlow.edges.filter((edge) => edge.source === currentNodeId);
      const currentNode = processFlow.nodes.find((node) => node.id === currentNodeId);

      if (currentNode) {
        setExecutionHistory([
          ...executionHistory,
          {
            timestamp: new Date(),
            nodeId: currentNodeId,
            action: t('history.completed'),
            details: t('history.completedDetails', {
              label: currentNode.data.label,
              type: isValidNodeType(currentNode.type ?? '') ? t(`nodeTypes.${currentNode.type}` as 'nodeTypes.start') : t('nodeTypes.unknown'),
            }),
          },
        ]);
      }

      if (currentEdges.length === 0) {
        setCurrentNodeId(null);
        setProgress(100);
        dispatch({ type: 'SET_COMPLETE', payload: true });
        dispatch({ type: 'SET_PLAYING', payload: false });
        updateNodeStyles(nodes, null, newCompletedNodeIds);
        return;
      }

      if (currentNode?.type === 'step' && currentEdges.length > 1) {
        const { nextNodeIds } = handleMultipleOutputs(currentNodeId);
        if (nextNodeIds.length === 0) return;

        setProgress(Math.round((newCompletedNodeIds.length / (processFlow.nodes.length - 1)) * 100));
        updateNodeStyles(nodes, null, newCompletedNodeIds);

        let maxLevel = currentLevel + 1;
        const allAvailableNodes: AvailableNode[] = [];

        nextNodeIds.forEach((nodeId) => {
          const { levels, availableNodes } = calculateLevelsAndAvailableNodes(processFlow.nodes, processFlow.edges, nodeId, newCompletedNodeIds);
          maxLevel = Math.max(maxLevel, levels);
          allAvailableNodes.push(...availableNodes);
        });

        setTotalLevels(maxLevel);
        setAvailableNodes(allAvailableNodes);
        setCurrentLevel(currentLevel + 1);
        updateParallelGroups();

        nextNodeIds.forEach((nodeId) => {
          const node = processFlow.nodes.find((n) => n.id === nodeId);
          if (node) {
            checkForDecisionRef.current(node);
            checkForAutomaticBehaviorRef.current(node);
          }
        });
        return;
      }

      const nextEdge = outcome !== 'default' && currentEdges.length > 1 ? currentEdges.find((edge) => edge.sourceHandle === outcome) : currentEdges[0];

      if (nextEdge) {
        const nextNodeId = nextEdge.target;
        const nextNode = processFlow.nodes.find((node) => node.id === nextNodeId);

        if (nextNode?.type === 'end') {
          setCurrentNodeId(nextNodeId);
          setProgress(100);
          updateNodeStyles(nodes, nextNodeId, newCompletedNodeIds);

          setTimeout(() => {
            setCompletedNodeIds([...newCompletedNodeIds, nextNodeId]);
            dispatch({ type: 'SET_COMPLETE', payload: true });
            dispatch({ type: 'SET_PLAYING', payload: false });
            updateNodeStyles(nodes, null, [...newCompletedNodeIds, nextNodeId]);
            setExecutionHistory([
              ...executionHistory,
              {
                timestamp: new Date(),
                nodeId: nextNodeId,
                action: t('history.processCompleted'),
                details: t('history.processCompletedDetails'),
              },
            ]);
          }, 1000);
          return;
        }

        setCurrentNodeId(nextNodeId);
        setProgress(Math.round((newCompletedNodeIds.length / (processFlow.nodes.length - 1)) * 100));
        updateNodeStyles(nodes, nextNodeId, newCompletedNodeIds);

        const { levels, availableNodes } = calculateLevelsAndAvailableNodes(processFlow.nodes, processFlow.edges, nextNodeId, newCompletedNodeIds);

        setTotalLevels(levels);
        setAvailableNodes(availableNodes);
        setCurrentLevel(availableNodes.find((n) => n.node.id === nextNodeId)?.level || currentLevel + 1);
        updateParallelGroups();

        if (nextNode) {
          checkForDecisionRef.current(nextNode);
          checkForAutomaticBehaviorRef.current(nextNode);
        }
      } else {
        setCurrentNodeId(null);
        setProgress(100);
        dispatch({ type: 'SET_COMPLETE', payload: true });
        dispatch({ type: 'SET_PLAYING', payload: false });
        updateNodeStyles(nodes, null, newCompletedNodeIds);
      }
    },
    [
      processFlow,
      currentNodeId,
      completedNodeIds,
      nodes,
      currentLevel,
      executionHistory,
      updateNodeStyles,
      calculateLevelsAndAvailableNodes,
      setCurrentNodeId,
      setCompletedNodeIds,
      setProgress,
      setExecutionHistory,
      setTotalLevels,
      setAvailableNodes,
      setCurrentLevel,
      updateParallelGroups,
      handleMultipleOutputs,
      dispatch,
      t,
    ]
  );

  // Update the refs with the latest function references
  useEffect(() => {
    advanceToNextNodeRef.current = advanceToNextNode;
    checkForDecisionRef.current = checkForDecision;
    checkForAutomaticBehaviorRef.current = checkForAutomaticBehavior;
    handleDecisionRef.current = handleDecision;
  }, [advanceToNextNode, checkForDecision, checkForAutomaticBehavior, handleDecision]);

  const resetExecution = useCallback(() => {
    if (!processFlow) return;

    dispatch({ type: 'SET_PLAYING', payload: false });
    dispatch({ type: 'SET_COMPLETE', payload: false });
    setCompletedNodeIds([]);
    setProgress(0);
    setPendingDecision(null);
    setExecutionHistory([]);

    Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
    timersRef.current = {};

    initializeNodeSpecificStates(processFlow.nodes);

    const startNode = processFlow.nodes.find((node) => node.type === 'start');
    if (startNode) {
      setCurrentNodeId(startNode.id);
      updateNodeStyles(nodes, startNode.id, []);
      setCurrentLevel(1);

      const { levels, availableNodes } = calculateLevelsAndAvailableNodes(processFlow.nodes, processFlow.edges, startNode.id, []);

      setTotalLevels(levels);
      setAvailableNodes(availableNodes);
      setExecutionHistory([
        {
          timestamp: new Date(),
          nodeId: startNode.id,
          action: t('history.processStart'),
          details: startNode.data.label,
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
    dispatch,
    t,
  ]);

  const togglePlayPause = useCallback(() => {
    if (!processFlow) return;

    if (isComplete) {
      resetExecution();
      return;
    }

    dispatch({ type: 'SET_PLAYING', payload: !isPlaying });

    if (!isPlaying) {
      const currentNode = processFlow.nodes.find((node) => node.id === currentNodeId);
      if (currentNode?.type === 'start') {
        advanceToNextNodeRef.current();
      } else if (currentNode) {
        checkForDecisionRef.current(currentNode);
        checkForAutomaticBehaviorRef.current(currentNode);
      }
    }
  }, [processFlow, isPlaying, isComplete, currentNodeId, resetExecution, dispatch]);

  const calculateTotalTime = useCallback(() => {
    if (!processFlow) return 0;

    return completedNodeIds.reduce((total, nodeId) => {
      const node = processFlow.nodes.find((n) => n.id === nodeId);
      if (!node) return total;

      let minutes = 0;

      if (node.data.estimatedTime) {
        minutes = Number(node.data.estimatedTime);
        if (node.data.timeUnit === 'hours') minutes *= 60;
        if (node.data.timeUnit === 'days') minutes *= 1440;
      } else if (node.type === 'timer' && node.data.duration) {
        minutes = Number(node.data.duration);
        if (node.data.timeUnit === 'seconds') minutes /= 60;
        if (node.data.timeUnit === 'hours') minutes *= 60;
        if (node.data.timeUnit === 'days') minutes *= 1440;
      }

      return total + minutes;
    }, 0);
  }, [processFlow, completedNodeIds]);

  const exportExecutionHistory = useCallback(() => {
    if (executionHistory.length === 0) return;

    const csvHeaders = 'Fecha,Hora,Nodo,Acción,Detalles\n';
    const csvRows = executionHistory
      .map((entry) => {
        const date = entry.timestamp.toLocaleDateString();
        const time = entry.timestamp.toLocaleTimeString();
        const action = entry.action.replace(/,/g, ';');
        const details = entry.details?.replace(/,/g, ';') || '';

        return `${date},${time},${entry.nodeId},${action},${details}`;
      })
      .join('\n');

    const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = t('export.executionHistoryFileName', {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [executionHistory]);

  return {
    isPlaying,
    advanceToNextNode,
    calculateTotalTime,
    exportExecutionHistory,
    handleDecision,
    resetExecution,
    togglePlayPause,
    checkForDecision,
    checkForAutomaticBehavior,
    updateParallelGroups,
  };
}
