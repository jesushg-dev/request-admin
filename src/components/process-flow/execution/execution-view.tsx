'use client';

import { useEffect } from 'react';
import { AlertTriangle, Download, Eye, FileText } from 'lucide-react';

import { isNodeWithEstimatedTime, isNodeWithMessage, isStepNode } from '@/lib/execution-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Hint } from '@/components/hint';

import { nodeTypes } from '../flow-builder/nodes';
import { useExecutionContext } from './execution-context';
import { ExecutionControls } from './execution-controls';
import { ExecutionHistory } from './execution-history';
import ExecutionViewError, { ExecutionViewSuccess } from './execution-view-state';
import { FlowDiagram } from './flow-diagram';
import { useExecutionState } from './hooks/use-execution-state';
import { useFlowExecution } from './hooks/use-flow-execution';
import { useNodeActions } from './hooks/use-node-actions';

export default function ExecutionView() {
  const { state, dispatch, timersRef } = useExecutionContext();
  const { processFlow, currentNodeId, completedNodeIds, nodes, edges, progress, executionHistory, availableNodes, nodeSpecificStates, pendingDecision, isPlaying, isComplete, error } = state;

  const { updateNodeStyles, calculateLevelsAndAvailableNodes, initializeNodeSpecificStates } = useExecutionState(timersRef);
  const { handleTimerStart, handleTimerPause, handleSendNotification, handleExecuteTask, handleLoopContinue } = useNodeActions();

  const { advanceToNextNode, handleDecision, resetExecution, togglePlayPause, calculateTotalTime, exportExecutionHistory } = useFlowExecution({
    updateNodeStyles,
    calculateLevelsAndAvailableNodes,
    initializeNodeSpecificStates,
    handleTimerStart,
    handleTimerPause,
    handleSendNotification,
    handleExecuteTask,
    handleLoopContinue,
  });

  useEffect(() => {
    if (isComplete) {
      dispatch({ type: 'SET_CURRENT_NODE_ID', payload: null });
      updateNodeStyles(nodes, null, completedNodeIds);
    }
  }, [isComplete, dispatch, updateNodeStyles, nodes, completedNodeIds]);

  if (error) return <ExecutionViewError error={error} />;

  if (!processFlow) {
    return (
      <div className="container py-6 flex items-center justify-center">
        <p>Cargando proceso...</p>
      </div>
    );
  }

  const currentNode = currentNodeId ? processFlow.nodes.find((node) => node.id === currentNodeId) : null;

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader className="flex w-full">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <CardTitle>Ejecución de Proceso</CardTitle>
            <CardDescription>Seguimiento del proceso en tiempo real</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <Hint label="Ver diagrama completo">
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
              </Hint>
              <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Diagrama de Flujo Completo</DialogTitle>
                </DialogHeader>
                <FlowDiagram nodes={nodes} edges={edges} nodeTypes={nodeTypes} />
              </DialogContent>
            </Dialog>
            <Hint label="Exportar Historial">
              <Button variant="outline" size="sm" onClick={exportExecutionHistory} disabled={executionHistory.length === 0}>
                <Download className="w-4 h-4" />
              </Button>
            </Hint>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Progreso total: {progress}%</span>
              <Badge variant="outline">
                Paso {completedNodeIds.length + (currentNodeId && !isComplete ? 1 : 0)} de {processFlow.nodes.length - 1}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {completedNodeIds.length}/{processFlow.nodes.length - 1} completado
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
          <div className="md:col-span-2 flex flex-col flex-1 overflow-hidden gap-2">
            <div className="flex-1 flex flex-col overflow-auto">
              {isComplete && (
                <div className="bg-green-50 p-4 rounded-md border border-green-200 mb-4">
                  <h3 className="text-lg font-medium text-green-800 mb-2">Proceso Completado</h3>
                  <p className="text-sm text-green-700 mb-4">El proceso ha finalizado correctamente</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Resumen del proceso:</p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li>Nodos completados: {completedNodeIds.length}</li>
                      <li>Tiempo total: {calculateTotalTime()} minutos</li>
                      <li>Pasos ejecutados: {executionHistory.length}</li>
                    </ul>
                  </div>
                  <Button onClick={resetExecution} size="sm" className="mt-4">
                    <AlertTriangle className="w-4 h-4 mr-2" /> Reiniciar Proceso
                  </Button>
                </div>
              )}

              {availableNodes
                .filter((n) => !n.isCompleted || isComplete)
                .sort((a, b) => a.level - b.level || (a.node.data.label || '').localeCompare(b.node.data.label || ''))
                .map((availableNode, index) => (
                  <div
                    key={availableNode.node.id}
                    className={`mb-4 p-4 border rounded-lg ${
                      availableNode.isActive && !isComplete
                        ? 'bg-blue-50 border-blue-200'
                        : availableNode.isBlocked && !isComplete
                          ? 'bg-gray-50 border-gray-200 opacity-70'
                          : completedNodeIds.includes(availableNode.node.id)
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-medium">{index + 1}</div>
                        <h3 className="text-lg font-medium">{availableNode.node.data.label}</h3>
                      </div>
                      <div>
                        {availableNode.isActive && !isComplete ? (
                          <Badge className="bg-blue-100 text-blue-800">En progreso</Badge>
                        ) : availableNode.isBlocked && !isComplete ? (
                          <Badge variant="outline" className="bg-gray-100">
                            Bloqueado
                          </Badge>
                        ) : completedNodeIds.includes(availableNode.node.id) ? (
                          <Badge className="bg-green-100 text-green-800">Completado</Badge>
                        ) : (
                          <Badge variant="outline">Pendiente</Badge>
                        )}
                      </div>
                    </div>

                    {isStepNode(availableNode.node) && <p className="text-sm text-gray-600 mb-2">{availableNode.node.data.action}</p>}

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {isNodeWithEstimatedTime(availableNode.node) && (
                        <div>
                          <p className="text-xs text-gray-500">Tiempo estimado</p>
                          <p className="text-sm">
                            {availableNode.node.data.estimatedTime} {availableNode.node.data.timeUnit}
                          </p>
                        </div>
                      )}

                      {isStepNode(availableNode.node) && (
                        <div>
                          <p className="text-xs text-gray-500">Responsable</p>
                          <p className="text-sm">{availableNode.node.data.responsible}</p>
                        </div>
                      )}

                      {availableNode.node.type === 'approval' && availableNode.node.data.approvers && (
                        <div>
                          <p className="text-xs text-gray-500">Aprobadores</p>
                          <p className="text-sm">{Array.isArray(availableNode.node.data.approvers) ? availableNode.node.data.approvers.join(', ') : availableNode.node.data.approvers}</p>
                        </div>
                      )}

                      {completedNodeIds.includes(availableNode.node.id) && (
                        <>
                          <div>
                            <p className="text-xs text-gray-500">Completado por</p>
                            <p className="text-sm">Carlos Mendoza</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Completado el</p>
                            <p className="text-sm">{new Date().toLocaleString()}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {availableNode.node.type === 'timer' && nodeSpecificStates[availableNode.node.id]?.timer && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Tiempo restante:</span>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800">
                            {nodeSpecificStates[availableNode.node.id].timer?.timeLeft || availableNode.node.data.duration} {availableNode.node.data.timeUnit}
                          </Badge>
                        </div>
                        <Progress
                          value={
                            nodeSpecificStates[availableNode.node.id].timer?.timerActive
                              ? ((availableNode.node.data.duration - (nodeSpecificStates[availableNode.node.id].timer?.timeLeft || 0)) / availableNode.node.data.duration) * 100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                    )}

                    {availableNode.node.type === 'notification' && nodeSpecificStates[availableNode.node.id]?.notification && (
                      <div className="mb-3 p-2 bg-gray-50 rounded">
                        <p className="text-sm font-medium">Estado de notificación:</p>
                        <p className="text-sm">
                          {nodeSpecificStates[availableNode.node.id].notification?.status === 'idle' && 'Pendiente de envío'}
                          {nodeSpecificStates[availableNode.node.id].notification?.status === 'sending' && 'Enviando...'}
                          {nodeSpecificStates[availableNode.node.id].notification?.status === 'success' && 'Enviado correctamente'}
                          {nodeSpecificStates[availableNode.node.id].notification?.status === 'error' && 'Error al enviar'}
                        </p>
                      </div>
                    )}

                    {availableNode.node.type === 'step' && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Guías de referencia</p>
                        <div className="flex flex-wrap gap-2">
                          {availableNode.node.data.linkedGuides && availableNode.node.data.linkedGuides.length > 0 ? (
                            availableNode.node.data.linkedGuides.map((guideId: string) => {
                              const guideTitles: Record<string, string> = {
                                'manual-activacion': 'Manual de activación de servicios móviles',
                                'verificacion-documentos': 'Verificación de documentos de identidad',
                                'planes-corporativos': 'Planes corporativos disponibles',
                                'tutorial-sistema': 'Tutorial: Sistema de activaciones',
                                'politicas-seguridad': 'Políticas de seguridad',
                                'procedimiento-escalacion': 'Procedimiento de escalación',
                              };
                              return (
                                <Button key={guideId} variant="outline" size="sm" className="text-xs h-8">
                                  <FileText className="w-3 h-3 mr-1" /> {guideTitles[guideId] || guideId}
                                </Button>
                              );
                            })
                          ) : (
                            <p className="text-xs text-muted-foreground">No hay guías vinculadas</p>
                          )}
                        </div>
                      </div>
                    )}

                    {isNodeWithMessage(availableNode.node) && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Notas</p>
                        <p className="text-sm p-2 bg-gray-50 rounded">{availableNode.node.data.message}</p>
                      </div>
                    )}

                    {availableNode.isActive && !isComplete && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {availableNode.node.type === 'condition' ? (
                          <>
                            <Button size="sm" onClick={() => handleDecision('yes')}>
                              Sí
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDecision('no')}>
                              No
                            </Button>
                          </>
                        ) : availableNode.node.type === 'approval' ? (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleDecision('approve')}>
                              Aprobar
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleDecision('reject')}>
                              Rechazar
                            </Button>
                          </>
                        ) : availableNode.node.type === 'timer' && nodeSpecificStates[availableNode.node.id]?.timer ? (
                          <>
                            {!nodeSpecificStates[availableNode.node.id].timer?.timerActive ? (
                              <Button size="sm" onClick={() => handleTimerStart(availableNode.node.id)}>
                                Iniciar Temporizador
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => handleTimerPause(availableNode.node.id)}>
                                Pausar
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => advanceToNextNode()}>
                              Omitir Espera
                            </Button>
                          </>
                        ) : availableNode.node.type === 'notification' && nodeSpecificStates[availableNode.node.id]?.notification ? (
                          <>
                            {nodeSpecificStates[availableNode.node.id].notification?.status === 'idle' && (
                              <Button size="sm" onClick={() => handleSendNotification(availableNode.node.id)}>
                                Enviar Notificación
                              </Button>
                            )}
                            {nodeSpecificStates[availableNode.node.id].notification?.status === 'error' && (
                              <Button size="sm" onClick={() => handleSendNotification(availableNode.node.id)}>
                                Reintentar
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => advanceToNextNode()} disabled={nodeSpecificStates[availableNode.node.id].notification?.status === 'sending'}>
                              Omitir
                            </Button>
                          </>
                        ) : availableNode.node.type === 'task' && nodeSpecificStates[availableNode.node.id]?.task ? (
                          <>
                            {nodeSpecificStates[availableNode.node.id].task?.status === 'idle' && (
                              <Button size="sm" onClick={() => handleExecuteTask(availableNode.node.id)}>
                                Ejecutar Tarea
                              </Button>
                            )}
                            {nodeSpecificStates[availableNode.node.id].task?.status === 'error' && (
                              <Button size="sm" onClick={() => handleExecuteTask(availableNode.node.id)}>
                                Reintentar
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => advanceToNextNode()} disabled={nodeSpecificStates[availableNode.node.id].task?.status === 'running'}>
                              Omitir
                            </Button>
                          </>
                        ) : availableNode.node.type === 'loop' && nodeSpecificStates[availableNode.node.id]?.loop ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleLoopContinue(availableNode.node.id)}
                              disabled={(nodeSpecificStates[availableNode.node.id].loop?.count || 0) >= (availableNode.node.data.maxIterations || 0)}>
                              Continuar Bucle
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDecision('error')}>
                              Salir del Bucle
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" onClick={() => advanceToNextNode()}>
                            Completar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

              {availableNodes.filter((n) => !n.isCompleted).length === 0 && !isComplete && (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-muted-foreground">No hay pasos disponibles</p>
                </div>
              )}
            </div>

            <ExecutionControls isPlaying={isPlaying} isComplete={isComplete} completedNodeIds={completedNodeIds} togglePlayPause={togglePlayPause} resetExecution={resetExecution} />
          </div>

          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            <div className="flex flex-col gap-4 overflow-auto">
              {currentNode && !isComplete && (
                <Card>
                  <div className="h-1 bg-blue-500"></div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Paso Actual</CardTitle>
                      <Badge className="bg-blue-100 text-blue-800">En Progreso</Badge>
                    </div>
                    <CardDescription>
                      {currentNode.type ? currentNode.type.charAt(0).toUpperCase() + currentNode.type.slice(1) : ''}: {currentNode.data.label}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isStepNode(currentNode) && <p className="text-sm text-gray-600 mb-3">{currentNode.data.action}</p>}

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {isNodeWithEstimatedTime(currentNode) && (
                        <div>
                          <p className="text-xs text-gray-500">Tiempo estimado</p>
                          <p className="text-sm">
                            {currentNode.data.estimatedTime} {currentNode.data.timeUnit}
                          </p>
                        </div>
                      )}

                      {isStepNode(currentNode) && (
                        <div>
                          <p className="text-xs text-gray-500">Responsable</p>
                          <p className="text-sm">{currentNode.data.responsible}</p>
                        </div>
                      )}
                    </div>

                    {pendingDecision && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                        <p className="text-sm font-medium mb-2">Se requiere una decisión:</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {pendingDecision.options.map((option, index) => (
                            <div key={index} className="flex flex-col gap-1 w-full">
                              <Button size="sm" variant={index === 0 ? 'default' : 'outline'} onClick={() => handleDecision(option.value)} className="w-full">
                                {option.label}
                              </Button>
                              {option.target && <p className="text-xs text-muted-foreground text-center">Siguiente: {option.target}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {isComplete && <ExecutionViewSuccess completedNodeIds={completedNodeIds} executionHistory={executionHistory} calculateTotalTime={calculateTotalTime} resetExecution={resetExecution} />}
              <ExecutionHistory executionHistory={executionHistory} nodes={nodes} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
