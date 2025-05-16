import type { Edge, Node } from '@xyflow/react';

// Validation function for the flow
export const validateFlow = (nodes: Node[], edges: Edge[]) => {
  const errors: { nodeId?: string; message: string }[] = [];

  // Check if there's at least one start node
  const startNodes = nodes.filter((node) => node.type === 'start');
  if (startNodes.length === 0) {
    errors.push({
      message: 'Flow must have at least one Start node',
    });
  } else if (startNodes.length > 1) {
    errors.push({
      message: 'Flow should have only one Start node',
    });
  }

  // Check if there's at least one end node
  const endNodes = nodes.filter((node) => node.type === 'end');
  if (endNodes.length === 0) {
    errors.push({
      message: 'Flow must have at least one End node',
    });
  }

  // Check for nodes without connections
  nodes.forEach((node) => {
    // Skip start nodes (they don't need incoming edges)
    if (node.type === 'start') {
      const outgoingEdges = edges.filter((edge) => edge.source === node.id);
      if (outgoingEdges.length === 0) {
        errors.push({
          nodeId: node.id,
          message: `Start node "${node.data.label}" has no outgoing connections`,
        });
      }
      return;
    }

    // Skip end nodes (they don't need outgoing edges)
    if (node.type === 'end') {
      const incomingEdges = edges.filter((edge) => edge.target === node.id);
      if (incomingEdges.length === 0) {
        errors.push({
          nodeId: node.id,
          message: `End node "${node.data.label}" has no incoming connections`,
        });
      }
      return;
    }

    // Skip annotation nodes (they don't need connections)
    if (node.type === 'annotation') {
      return;
    }

    // Check for incoming edges
    const incomingEdges = edges.filter((edge) => edge.target === node.id);
    if (incomingEdges.length === 0) {
      errors.push({
        nodeId: node.id,
        message: `Node "${node.data.label}" has no incoming connections`,
      });
    }

    // Check for outgoing edges
    const outgoingEdges = edges.filter((edge) => edge.source === node.id);
    if (outgoingEdges.length === 0) {
      errors.push({
        nodeId: node.id,
        message: `Node "${node.data.label}" has no outgoing connections`,
      });
    }

    // Specific validations for different node types
    if (node.type === 'condition') {
      // Conditions should have at least two outgoing edges (yes/no)
      if (outgoingEdges.length < 2) {
        errors.push({
          nodeId: node.id,
          message: `Condition node "${node.data.label}" should have at least two outgoing connections (Yes/No)`,
        });
      }

      // Check if condition expression is defined
      if (!node.data.expression) {
        errors.push({
          nodeId: node.id,
          message: `Condition node "${node.data.label}" has no expression defined`,
        });
      }
    }

    if (node.type === 'loop') {
      // Check if loop condition is defined
      if (!node.data.condition) {
        errors.push({
          nodeId: node.id,
          message: `Loop node "${node.data.label}" has no condition defined`,
        });
      }

      // Check if max iterations is defined and reasonable
      if (!node.data.maxIterations || node.data.maxIterations <= 0) {
        errors.push({
          nodeId: node.id,
          message: `Loop node "${node.data.label}" has invalid max iterations value`,
        });
      }
    }

    if (node.type === 'step') {
      // Check if action is defined
      if (!node.data.action) {
        errors.push({
          nodeId: node.id,
          message: `Step node "${node.data.label}" has no action defined`,
        });
      }

      // Check if responsible is defined
      if (!node.data.responsible) {
        errors.push({
          nodeId: node.id,
          message: `Step node "${node.data.label}" has no responsible defined`,
        });
      }
    }
  });

  // Check for cycles (excluding loops that are intentional)
  // This is a simplified cycle detection and might need more sophisticated algorithms
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const hasCycle = (nodeId: string): boolean => {
    if (recursionStack.has(nodeId)) {
      return true;
    }

    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = edges.filter((edge) => edge.source === nodeId);
    for (const edge of outgoingEdges) {
      // Skip if this is a loop node (intentional cycle)
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (sourceNode?.type === 'loop') {
        continue;
      }

      if (hasCycle(edge.target)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  // Start cycle detection from all start nodes
  for (const startNode of startNodes) {
    if (hasCycle(startNode.id)) {
      errors.push({
        message: 'Flow contains unintended cycles (infinite loops)',
      });
      break;
    }
  }

  return errors;
};
