'use client';

import { AlertTriangle, ArrowRight, Bell, CheckCircle2, CheckSquare, Clock, Cpu, GitBranch, GitMerge, Layers, MessageSquare, Play, RefreshCw, Square, User } from 'lucide-react';

import type { FlowNode, NodeSpecificState } from '@/types/execution';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface NodeCardProps {
  node: FlowNode;
  isActive: boolean;
  isBlocked: boolean;
  dependenciesCompleted: boolean;
  hasSlaWarning?: boolean;
  nodeState?: NodeSpecificState;
  onComplete: () => void;
  onDecision: (outcome: string) => void;
  onTimerStart: (nodeId: string) => void;
  onTimerPause: (nodeId: string) => void;
  onSendNotification: (nodeId: string) => void;
  onExecuteTask: (nodeId: string) => void;
  onLoopContinue: (nodeId: string) => void;
}

export function NodeCard({
  node,
  isActive,
  isBlocked,
  dependenciesCompleted,
  hasSlaWarning = false,
  nodeState,
  onComplete,
  onDecision,
  onTimerStart,
  onTimerPause,
  onSendNotification,
  onExecuteTask,
  onLoopContinue,
}: NodeCardProps) {
  // Determinar el color de la tarjeta según el tipo de nodo
  const getCardClass = () => {
    if (isBlocked) return 'border-gray-200 bg-gray-50 opacity-70';
    if (isActive) return 'border-blue-300 bg-blue-50';

    switch (node.type) {
      case 'start':
        return 'border-green-200 bg-green-50';
      case 'end':
        return 'border-red-200 bg-red-50';
      case 'condition':
        return 'border-yellow-200 bg-yellow-50';
      case 'approval':
        return 'border-emerald-200 bg-emerald-50';
      case 'notification':
        return 'border-pink-200 bg-pink-50';
      case 'message':
        return 'border-violet-200 bg-violet-50';
      case 'timer':
        return 'border-amber-200 bg-amber-50';
      case 'task':
        return 'border-indigo-200 bg-indigo-50';
      case 'loop':
        return 'border-purple-200 bg-purple-50';
      case 'gateway':
        return 'border-teal-200 bg-teal-50';
      case 'subprocess':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  // Obtener icono según el tipo de nodo
  const getNodeIcon = () => {
    switch (node.type) {
      case 'start':
        return <Play className="w-5 h-5 text-green-600 fill-green-500" />;
      case 'end':
        return <Square className="w-5 h-5 text-red-600 fill-red-500" />;
      case 'condition':
        return <GitBranch className="w-5 h-5 text-yellow-600" />;
      case 'approval':
        return <CheckSquare className="w-5 h-5 text-emerald-600" />;
      case 'notification':
        return <Bell className="w-5 h-5 text-pink-600" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-violet-600" />;
      case 'timer':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'task':
        return <Cpu className="w-5 h-5 text-indigo-600" />;
      case 'loop':
        return <RefreshCw className="w-5 h-5 text-purple-600" />;
      case 'gateway':
        return <GitMerge className="w-5 h-5 text-teal-600" />;
      case 'subprocess':
        return <Layers className="w-5 h-5 text-gray-600" />;
      default:
        return <ArrowRight className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <Card key={node.id} className={`${getCardClass()} ${isActive ? 'ring-2 ring-blue-300' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getNodeIcon()}
            <CardTitle className="text-lg">{node.data.label}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {hasSlaWarning && (
              <Badge variant="outline" className="bg-red-100 text-red-800">
                <AlertTriangle className="w-3 h-3 mr-1" /> SLA
              </Badge>
            )}
            {isBlocked ? (
              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                Bloqueado
              </Badge>
            ) : isActive ? (
              <Badge className="bg-blue-100 text-blue-800">Activo</Badge>
            ) : (
              <Badge variant="outline">Pendiente</Badge>
            )}
          </div>
        </div>
        <CardDescription>
          {node.type === 'start' && 'Inicio del proceso'}
          {node.type === 'end' && 'Fin del proceso'}
          {node.type === 'condition' && `Condición: ${node.data.expression || 'No definida'}`}
          {node.type === 'approval' && 'Requiere aprobación'}
          {node.type === 'notification' && `Notificación por ${node.data.channel || 'email'}`}
          {node.type === 'message' && 'Mensaje informativo'}
          {node.type === 'timer' && `Espera: ${node.data.duration} ${node.data.timeUnit}`}
          {node.type === 'task' && `Tarea: ${node.data.type || 'manual'}`}
          {node.type === 'loop' && `Bucle (max: ${node.data.maxIterations})`}
          {node.type === 'gateway' && `Gateway ${node.data.type === 'parallel' ? 'Paralelo' : 'Inclusivo'}`}
          {node.type === 'subprocess' && `Subproceso: ${node.data.processRef || 'No definido'}`}
          {node.type === 'step' && (node.data.action || 'Paso del proceso')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Contenido específico según el tipo de nodo */}
        {node.type === 'step' && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {node.data.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>
                  {node.data.estimatedTime} {node.data.timeUnit}
                </span>
              </div>
            )}
            {node.data.responsible && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{node.data.responsible}</span>
              </div>
            )}
          </div>
        )}

        {node.type === 'timer' && isActive && nodeState?.timer && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Tiempo restante:</span>
              <Badge variant="outline" className="bg-amber-100 text-amber-800">
                {nodeState.timer.timeLeft || node.data.duration} {node.data.timeUnit}
              </Badge>
            </div>
            <Progress value={nodeState.timer.timerActive ? ((node.data.duration - (nodeState.timer.timeLeft || 0)) / node.data.duration) * 100 : 0} className="h-2" />
          </div>
        )}

        {node.type === 'notification' && isActive && nodeState?.notification && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm">Estado:</span>
            {nodeState.notification.status === 'idle' && <Badge variant="outline">Pendiente</Badge>}
            {nodeState.notification.status === 'sending' && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <span className="animate-pulse mr-1">⏳</span> Enviando...
              </Badge>
            )}
            {nodeState.notification.status === 'success' && (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Enviado
              </Badge>
            )}
            {nodeState.notification.status === 'error' && (
              <Badge variant="outline" className="bg-red-100 text-red-800">
                <AlertTriangle className="w-3 h-3 mr-1" /> Error
              </Badge>
            )}
          </div>
        )}

        {node.type === 'task' && isActive && nodeState?.task && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm">Estado:</span>
            {nodeState.task.status === 'idle' && <Badge variant="outline">Pendiente</Badge>}
            {nodeState.task.status === 'running' && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <span className="animate-pulse mr-1">⚙️</span> Ejecutando...
              </Badge>
            )}
            {nodeState.task.status === 'success' && (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Completada
              </Badge>
            )}
            {nodeState.task.status === 'error' && (
              <Badge variant="outline" className="bg-red-100 text-red-800">
                <AlertTriangle className="w-3 h-3 mr-1" /> Error
              </Badge>
            )}
          </div>
        )}

        {node.type === 'loop' && isActive && nodeState?.loop && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm">Iteración:</span>
            <Badge variant="outline" className="bg-purple-100">
              {nodeState.loop.count || 0} / {node.data.maxIterations}
            </Badge>
          </div>
        )}

        {node.type === 'message' && node.data.message && <div className="p-2 bg-violet-100/50 rounded text-sm mt-2">{node.data.message}</div>}

        {/* Mostrar dependencias bloqueantes */}
        {isBlocked && !dependenciesCompleted && (
          <div className="mt-3 p-2 bg-gray-100 rounded-md text-sm">
            <p className="text-gray-600 font-medium">Dependencias pendientes</p>
          </div>
        )}
      </CardContent>

      {isActive && node.type !== 'start' && node.type !== 'end' && (
        <CardFooter className="pt-0">
          <div className="flex flex-wrap gap-2 w-full">
            {/* Botones específicos según el tipo de nodo */}
            {node.type === 'condition' ? (
              <>
                <Button size="sm" onClick={() => onDecision('yes')}>
                  Sí
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDecision('no')}>
                  No
                </Button>
              </>
            ) : node.type === 'approval' ? (
              <>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => onDecision('approve')}>
                  Aprobar
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => onDecision('reject')}>
                  Rechazar
                </Button>
              </>
            ) : node.type === 'timer' && nodeState?.timer ? (
              <>
                {!nodeState.timer.timerActive ? (
                  <Button size="sm" onClick={() => onTimerStart(node.id)}>
                    Iniciar Temporizador
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => onTimerPause(node.id)}>
                    Pausar
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={onComplete}>
                  Omitir Espera
                </Button>
              </>
            ) : node.type === 'notification' && nodeState?.notification ? (
              <>
                {nodeState.notification.status === 'idle' && (
                  <Button size="sm" onClick={() => onSendNotification(node.id)}>
                    Enviar Notificación
                  </Button>
                )}
                {nodeState.notification.status === 'error' && (
                  <Button size="sm" onClick={() => onSendNotification(node.id)}>
                    Reintentar
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={onComplete} disabled={nodeState.notification.status === 'sending'}>
                  Omitir
                </Button>
              </>
            ) : node.type === 'task' && nodeState?.task ? (
              <>
                {nodeState.task.status === 'idle' && (
                  <Button size="sm" onClick={() => onExecuteTask(node.id)}>
                    Ejecutar Tarea
                  </Button>
                )}
                {nodeState.task.status === 'error' && (
                  <Button size="sm" onClick={() => onExecuteTask(node.id)}>
                    Reintentar
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={onComplete} disabled={nodeState.task.status === 'running'}>
                  Omitir
                </Button>
              </>
            ) : node.type === 'loop' && nodeState?.loop ? (
              <>
                <Button size="sm" onClick={() => onLoopContinue(node.id)} disabled={(nodeState.loop.count || 0) >= (node.data.maxIterations || 0)}>
                  Continuar Bucle
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDecision('error')}>
                  Salir del Bucle
                </Button>
              </>
            ) : node.type === 'gateway' ? (
              <>
                <Button size="sm" onClick={() => onDecision('path_0')}>
                  Seleccionar Camino
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={onComplete}>
                Completar
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
