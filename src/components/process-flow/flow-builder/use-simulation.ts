'use client';

import { useCallback, useState } from 'react';

import type { EndNodeType, FlowEdge, FlowNode, StartNodeType, StepNodeData, TimerNodeData } from '@/types/execution-flow';

interface SimulationMetrics {
  totalTime: number;
  nodeVisits: Record<string, number>;
  slaCompliance: {
    met: number;
    notMet: number;
  };
}

// Simulation controller for the flow
export const useSimulation = (nodes: FlowNode[], edges: FlowEdge[]) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [visitedNodeIds, setVisitedNodeIds] = useState<string[]>([]);
  const [simulationPath, setSimulationPath] = useState<string[]>([]);
  const [simulationMetrics, setSimulationMetrics] = useState<SimulationMetrics>({
    totalTime: 0,
    nodeVisits: {},
    slaCompliance: { met: 0, notMet: 0 },
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1000); // ms per step

  const startSimulation = useCallback(() => {
    const startNode = nodes.find((node): node is StartNodeType => node.type === 'start');
    if (!startNode) return;

    setActiveNodeId(startNode.id);
    setVisitedNodeIds([startNode.id]);
    setSimulationPath([startNode.id]);
    setSimulationMetrics({
      totalTime: 0,
      nodeVisits: { [startNode.id]: 1 },
      slaCompliance: { met: 0, notMet: 0 },
    });
    setIsSimulating(true);
  }, [nodes]);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    setActiveNodeId(null);
    setVisitedNodeIds([]);
    setSimulationPath([]);
  }, []);

  // Step through simulation
  const stepSimulation = useCallback(() => {
    if (!activeNodeId || !isSimulating) return;

    // Find outgoing edges from the active node
    const outgoingEdges = edges.filter((edge) => edge.source === activeNodeId);

    if (outgoingEdges.length === 0) {
      // If no outgoing edges, stop simulation
      setIsSimulating(false);
      return;
    }

    // For simplicity, just take the first outgoing edge
    // todo: In a real implementation, you would use conditions to determine which path to take
    const nextEdge = outgoingEdges[0];
    const nextNodeId = nextEdge.target;

    // Update active node
    setActiveNodeId(nextNodeId);

    // Update visited nodes
    setVisitedNodeIds((prev) => [...prev, nextNodeId]);

    // Update simulation path
    setSimulationPath((prev) => [...prev, nextNodeId]);

    // Update metrics
    setSimulationMetrics((prev: SimulationMetrics) => {
      const nextNode = nodes.find((node) => node.id === nextNodeId);
      let timeIncrement = 0;

      // Calculate time based on node type
      if (nextNode?.type === 'step') {
        const data = nextNode.data as StepNodeData;
        if (data.sla) {
          timeIncrement = Number.parseInt(data.sla) || 0;
        }
      } else if (nextNode?.type === 'timer') {
        const data = nextNode.data as TimerNodeData;
        if (data.duration) {
          timeIncrement = Number.parseInt(data.duration.toString()) || 0;
          // Convert to hours for consistency
          if (data.timeUnit === 'minutes') timeIncrement /= 60;
          else if (data.timeUnit === 'seconds') timeIncrement /= 3600;
          else if (data.timeUnit === 'days') timeIncrement *= 24;
        }
      }

      // Update node visits
      const nodeVisits = { ...prev.nodeVisits };
      nodeVisits[nextNodeId] = (nodeVisits[nextNodeId] || 0) + 1;

      const slaCompliance = { ...prev.slaCompliance };
      if (nextNode?.type === 'step') {
        // todo: simplified SLA compliance check
        const metSla = Math.random() > 0.3;
        metSla ? slaCompliance.met++ : slaCompliance.notMet++;
      }

      return {
        totalTime: prev.totalTime + timeIncrement,
        nodeVisits,
        slaCompliance,
      };
    });

    // If we reached an end node, stop simulation
    const nextNode = nodes.find((n): n is EndNodeType => n.type === 'end' && n.id === nextNodeId);
    if (nextNode) setIsSimulating(false);
  }, [activeNodeId, isSimulating, edges, nodes]);

  // Auto-step simulation
  const autoStepSimulation = useCallback(() => {
    if (!isSimulating) return;

    const interval = setInterval(stepSimulation, simulationSpeed);
    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, stepSimulation]);

  return {
    activeNodeId,
    visitedNodeIds,
    simulationPath,
    simulationMetrics,
    isSimulating,
    simulationSpeed,
    startSimulation,
    stopSimulation,
    stepSimulation,
    autoStepSimulation,
    setSimulationSpeed,
  };
};
