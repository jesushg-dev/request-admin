'use client';

import { Pause, Play, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ExecutionControlsProps {
  isPlaying: boolean;
  isComplete: boolean;
  completedNodeIds: string[];
  togglePlayPause: () => void;
  resetExecution: () => void;
}

export function ExecutionControls({ isPlaying, isComplete, completedNodeIds, togglePlayPause, resetExecution }: ExecutionControlsProps) {
  return (
    <div className="flex justify-center gap-4">
      <Button variant={isPlaying ? 'outline' : 'default'} size="sm" onClick={togglePlayPause} disabled={isComplete && !isPlaying}>
        {isComplete ? (
          <>
            <RotateCcw className="w-4 h-4 mr-2" /> Reiniciar
          </>
        ) : isPlaying ? (
          <>
            <Pause className="w-4 h-4 mr-2" /> Pausar
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" /> {completedNodeIds.length === 0 ? 'Iniciar' : 'Continuar'}
          </>
        )}
      </Button>

      {!isPlaying && !isComplete && (
        <Button variant="outline" size="sm" onClick={resetExecution}>
          <RotateCcw className="w-4 h-4 mr-2" /> Reiniciar
        </Button>
      )}
    </div>
  );
}
