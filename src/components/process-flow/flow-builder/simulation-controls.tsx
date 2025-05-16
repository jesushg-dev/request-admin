'use client';

import { useCallback, useEffect, useState } from 'react';
import { Panel } from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import { Clock, Pause, Play, RotateCcw, SkipForward } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface SimulationMetrics {
  totalTime: number;
  nodeVisits: Record<string, number>;
  slaCompliance: {
    met: number;
    notMet: number;
  };
}

interface SimulationControlsProps {
  nodes: Node[];
  edges: Edge[];
}

export default function SimulationControls({ nodes, edges }: SimulationControlsProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [visitedNodeIds, setVisitedNodeIds] = useState<string[]>([]);
  const [simulationPath, setSimulationPath] = useState<string[]>([]);
  const [simulationMetrics, setSimulationMetrics] = useState<SimulationMetrics>({
    totalTime: 0,
    nodeVisits: {},
    slaCompliance: { met: 0, notMet: 0 },
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1000); // ms per step
  const [simulationStep, setSimulationStep] = useState(0);
  const [simulationComplete, setSimulationComplete] = useState(false);

  // Start simulation from the start node
  const startSimulation = useCallback(() => {
    const startNode = nodes.find((node) => node.type === 'start');
    if (!startNode) return;

    setActiveNodeId(startNode.id);
    setVisitedNodeIds([startNode.id]);
    setSimulationPath([startNode.id]);
    setSimulationMetrics({
      totalTime: 0,
      nodeVisits: { [startNode.id]: 1 },
      slaCompliance: { met: 0, notMet: 0 },
    });
    setSimulationStep(0);
    setSimulationComplete(false);
  }, [nodes]);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    setActiveNodeId(null);
    setVisitedNodeIds([]);
    setSimulationPath([]);
    setSimulationStep(0);
    setSimulationComplete(false);
    setSimulationMetrics({
      totalTime: 0,
      nodeVisits: {},
      slaCompliance: { met: 0, notMet: 0 },
    });
  }, []);

  // Step through simulation
  const stepSimulation = useCallback(() => {
    if (!activeNodeId || simulationComplete) return;

    // Find outgoing edges from the active node
    const outgoingEdges = edges.filter((edge) => edge.source === activeNodeId);

    if (outgoingEdges.length === 0) {
      // If no outgoing edges, stop simulation
      setIsPlaying(false);
      setSimulationComplete(true);
      return;
    }

    // For simplicity, just take the first outgoing edge
    // In a real implementation, you would use conditions to determine which path to take
    const nextEdge = outgoingEdges[0];
    const nextNodeId = nextEdge.target;

    // Update active node
    setActiveNodeId(nextNodeId);

    // Update visited nodes
    setVisitedNodeIds((prev) => [...prev, nextNodeId]);

    // Update simulation path
    setSimulationPath((prev) => [...prev, nextNodeId]);

    // Update simulation step
    setSimulationStep((prev) => prev + 1);

    // Update metrics
    setSimulationMetrics((prev: SimulationMetrics) => {
      const nextNode = nodes.find((node) => node.id === nextNodeId);
      let timeIncrement = 0;

      // Calculate time based on node type
      if (nextNode?.type === 'step' && nextNode.data.estimatedTime) {
        timeIncrement = Number.parseInt(String(nextNode.data.estimatedTime)) || 0;

        // Convert to hours for consistency
        if (nextNode.data.timeUnit === 'minutes') {
          timeIncrement /= 60;
        } else if (nextNode.data.timeUnit === 'days') {
          timeIncrement *= 24;
        }
      } else if (nextNode?.type === 'timer' && nextNode.data.duration) {
        timeIncrement = Number.parseInt(String(nextNode.data.duration)) || 0;

        // Convert to hours for consistency
        if (nextNode.data.timeUnit === 'minutes') {
          timeIncrement /= 60;
        } else if (nextNode.data.timeUnit === 'seconds') {
          timeIncrement /= 3600;
        } else if (nextNode.data.timeUnit === 'days') {
          timeIncrement *= 24;
        }
      }

      // Update node visits
      const nodeVisits = { ...prev.nodeVisits };
      nodeVisits[nextNodeId] = (nodeVisits[nextNodeId] || 0) + 1;

      // Update SLA compliance
      const slaCompliance = { ...prev.slaCompliance };
      if (nextNode?.type === 'step' && nextNode.data.sla) {
        // Simplified SLA compliance check
        const metSla = Math.random() > 0.3; // 70% chance of meeting SLA
        if (metSla) {
          slaCompliance.met++;
        } else {
          slaCompliance.notMet++;
        }
      }

      return {
        totalTime: prev.totalTime + timeIncrement,
        nodeVisits,
        slaCompliance,
      };
    });

    // If we reached an end node, stop simulation
    const nextNode = nodes.find((node) => node.id === nextNodeId);
    if (nextNode?.type === 'end') {
      setIsPlaying(false);
      setSimulationComplete(true);
    }
  }, [activeNodeId, simulationComplete, edges, nodes]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!activeNodeId && !isPlaying) {
      startSimulation();
    }
    setIsPlaying((prev) => !prev);
  }, [activeNodeId, isPlaying, startSimulation]);

  // Auto-step simulation when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      stepSimulation();
    }, simulationSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, simulationSpeed, stepSimulation]);

  // Highlight active and visited nodes
  useEffect(() => {
    // Reset all node styles
    nodes.forEach((node) => {
      const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
      if (nodeElement) {
        nodeElement.classList.remove('ring-2', 'ring-blue-500', 'ring-green-500', 'ring-offset-2');
      }
    });

    // Highlight visited nodes
    visitedNodeIds.forEach((id) => {
      const nodeElement = document.querySelector(`[data-id="${id}"]`);
      if (nodeElement) {
        nodeElement.classList.add('ring-2', 'ring-green-500', 'ring-offset-2');
      }
    });

    // Highlight active node
    if (activeNodeId) {
      const activeElement = document.querySelector(`[data-id="${activeNodeId}"]`);
      if (activeElement) {
        activeElement.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
      }
    }
  }, [nodes, activeNodeId, visitedNodeIds]);

  return (
    <Panel position="bottom-center" className="mb-8">
      <Card className="w-[500px]">
        <CardHeader className="pb-3">
          <CardTitle>Simulación</CardTitle>
          <CardDescription>
            {simulationComplete
              ? 'Simulación completada!'
              : activeNodeId
                ? `Paso ${simulationStep}: ${nodes.find((n) => n.id === activeNodeId)?.data.label || 'Desconocido'}`
                : 'Inicia la simulación para visualizar el flujo del proceso'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" onClick={togglePlay} disabled={simulationComplete}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={stepSimulation} disabled={isPlaying || simulationComplete || !activeNodeId}>
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={resetSimulation}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 w-[200px]">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-2">Velocidad:</span>
              <Slider value={[simulationSpeed]} min={100} max={2000} step={100} onValueChange={(value) => setSimulationSpeed(value[0])} className="w-[120px]" />
            </div>
          </div>

          {activeNodeId && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{simulationMetrics.totalTime.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Horas Totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Object.keys(simulationMetrics.nodeVisits).length}</div>
                <div className="text-xs text-muted-foreground">Nodos Visitados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {simulationMetrics.slaCompliance.met + simulationMetrics.slaCompliance.notMet > 0
                    ? `${Math.round((simulationMetrics.slaCompliance.met / (simulationMetrics.slaCompliance.met + simulationMetrics.slaCompliance.notMet)) * 100)}%`
                    : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Cumplimiento SLA</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Panel>
  );
}
