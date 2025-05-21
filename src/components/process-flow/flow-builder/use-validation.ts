import type { Edge, Node } from '@xyflow/react';
import { useTranslations } from 'next-intl';

import type { ConditionNodeType, FlowEdge, FlowNode, LoopNodeType, StepNodeType } from '@/types/execution-flow';

type ValidationError = {
  nodeId?: string;
  message: string;
};

// Validation function for the flow
export const useValidationFlow = () => {
  const t = useTranslations('component.flowExecution.validation');

  const validateFlow = (nodes: FlowNode[], edges: FlowEdge[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Check if there's at least one start node
    const startNodes = nodes.filter((node) => node.type === 'start');
    if (startNodes.length === 0) {
      errors.push({ message: t('mustHaveStart') });
    } else if (startNodes.length > 1) {
      errors.push({ message: t('onlyOneStart') });
    }

    // Check if there's at least one end node
    const endNodes = nodes.filter((node) => node.type === 'end');
    if (endNodes.length === 0) {
      errors.push({ message: t('mustHaveEnd') });
    }

    // Check for nodes without connections
    nodes.forEach((node) => {
      const nodeData = node.data;

      if (node.type === 'start') {
        const outgoingEdges = edges.filter((edge) => edge.source === node.id);
        if (outgoingEdges.length === 0) {
          errors.push({
            nodeId: node.id,
            message: t('startNoOutgoing', { label: nodeData.label }),
          });
        }
        return;
      }

      if (node.type === 'end') {
        const incomingEdges = edges.filter((edge) => edge.target === node.id);
        if (incomingEdges.length === 0) {
          errors.push({
            nodeId: node.id,
            message: t('endNoIncoming', { label: nodeData.label }),
          });
        }
        return;
      }

      if (node.type === 'annotation') return;

      const incomingEdges = edges.filter((edge) => edge.target === node.id);
      const outgoingEdges = edges.filter((edge) => edge.source === node.id);

      if (incomingEdges.length === 0) {
        errors.push({
          nodeId: node.id,
          message: t('nodeNoIncoming', { label: nodeData.label }),
        });
      }

      if (outgoingEdges.length === 0) {
        errors.push({
          nodeId: node.id,
          message: t('nodeNoOutgoing', { label: nodeData.label }),
        });
      }

      switch (node.type) {
        case 'condition':
          const conditionData = (node as ConditionNodeType).data;
          if (outgoingEdges.length < 2) {
            errors.push({
              nodeId: node.id,
              message: t('conditionMinOutgoing', { label: nodeData.label }),
            });
          }
          if (!conditionData.expression) {
            errors.push({
              nodeId: node.id,
              message: t('conditionNoExpression', { label: nodeData.label }),
            });
          }
          break;

        case 'loop':
          const loopData = (node as LoopNodeType).data;
          if (!loopData.condition) {
            errors.push({
              nodeId: node.id,
              message: t('loopNoCondition', { label: nodeData.label }),
            });
          }
          if (!loopData.maxIterations || loopData.maxIterations <= 0) {
            errors.push({
              nodeId: node.id,
              message: t('loopInvalidMax', { label: nodeData.label }),
            });
          }
          break;

        case 'step':
          const stepData = (node as StepNodeType).data;
          if (!stepData.action) {
            errors.push({
              nodeId: node.id,
              message: t('stepNoAction', { label: nodeData.label }),
            });
          }
          if (!stepData.responsible) {
            errors.push({
              nodeId: node.id,
              message: t('stepNoResponsible', { label: nodeData.label }),
            });
          }
          break;
      }
    });

    // Cycle detection logic
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = edges.filter((edge) => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        if (sourceNode?.type === 'loop') continue;

        if (hasCycle(edge.target)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    startNodes.forEach((startNode) => {
      if (hasCycle(startNode.id)) {
        errors.push({ message: t('cycleDetected') });
      }
    });

    return errors;
  };

  return { validateFlow };
};
