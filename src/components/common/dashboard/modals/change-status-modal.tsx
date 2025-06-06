'use client';

import type React from 'react';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: string;
  requestId: string;
}

// Definir las transiciones válidas para cada estado
const validTransitions: Record<string, string[]> = {
  Borrador: ['En revisión', 'Cancelado'],
  'En revisión': ['En progreso', 'Borrador', 'Cancelado'],
  'En progreso': ['Cerrado', 'En revisión', 'Cancelado'],
  Cerrado: ['En revisión'], // Solo se puede reabrir a revisión
  Cancelado: ['Borrador'], // Solo se puede restaurar a borrador en casos especiales
};

// Mensajes explicativos para cada transición
const transitionMessages: Record<string, string> = {
  Borrador: 'Un borrador puede enviarse a revisión o cancelarse.',
  'En revisión': 'Una solicitud en revisión puede avanzar a progreso, devolverse a borrador o cancelarse.',
  'En progreso': 'Una solicitud en progreso puede cerrarse, devolverse a revisión o cancelarse.',
  Cerrado: 'Una solicitud cerrada solo puede reabrirse para revisión.',
  Cancelado: 'Una solicitud cancelada solo puede restaurarse como borrador en casos excepcionales.',
};

export function ChangeStatusModal({ isOpen, onClose, currentStatus, requestId }: ChangeStatusModalProps) {
  const [newStatus, setNewStatus] = useState<string>('');
  const [requiresReason, setRequiresReason] = useState<boolean>(false);

  // Obtener los estados válidos para la transición actual
  const validNextStates = validTransitions[currentStatus] || [];

  // Verificar si el cambio requiere justificación
  const checkIfRequiresReason = (status: string) => {
    // Cambios que requieren justificación obligatoria
    const requiresReasonChanges = [
      'Cancelado', // Cancelar siempre requiere justificación
      'Borrador', // Devolver a borrador requiere justificación
      'En revisión', // Reabrir requiere justificación
    ];

    setRequiresReason(requiresReasonChanges.includes(status));
  };

  const handleStatusChange = (status: string) => {
    setNewStatus(status);
    checkIfRequiresReason(status);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const reasonInput = form.elements.namedItem('comments') as HTMLTextAreaElement;

    // Validar que se proporcione una razón cuando es obligatorio
    if (requiresReason && (!reasonInput.value || reasonInput.value.trim() === '')) {
      toast.error('Debes proporcionar una razón para este cambio de estado.', {
        description: 'Se requiere justificación',
      });
      return;
    }

    toast.success(`El estado de la solicitud #${requestId} ha sido actualizado de "${currentStatus}" a "${newStatus}".`, {
      description: 'Estado actualizado',
    });

    setNewStatus('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cambiar estado de la solicitud</DialogTitle>
          <DialogDescription>Actualiza el estado de la solicitud #{requestId}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-status">Estado actual</Label>
              <div className="text-sm text-muted-foreground">{currentStatus}</div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Flujo de estados</AlertTitle>
              <AlertDescription>{transitionMessages[currentStatus]}</AlertDescription>
            </Alert>

            <div className="grid gap-2">
              <Label htmlFor="new-status">Nuevo estado</Label>
              <Select required value={newStatus} onValueChange={handleStatusChange}>
                <SelectTrigger id="new-status">
                  <SelectValue placeholder="Selecciona el nuevo estado" />
                </SelectTrigger>
                <SelectContent>
                  {validNextStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="comments">{requiresReason ? 'Justificación (obligatoria)' : 'Comentarios (opcional)'}</Label>
                {requiresReason && <span className="text-xs text-destructive">*Requerido</span>}
              </div>
              <Textarea
                id="comments"
                placeholder={requiresReason ? 'Explica por qué se está realizando este cambio de estado...' : 'Añade un comentario sobre el cambio de estado...'}
                rows={3}
                required={requiresReason}
              />
            </div>

            {newStatus === 'Cerrado' && (
              <div className="grid gap-2">
                <Label htmlFor="resolution">Resolución</Label>
                <Select required defaultValue="resuelto">
                  <SelectTrigger id="resolution">
                    <SelectValue placeholder="Selecciona el tipo de resolución" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resuelto">Resuelto</SelectItem>
                    <SelectItem value="resuelto-parcial">Resuelto parcialmente</SelectItem>
                    <SelectItem value="no-resuelto">No resuelto</SelectItem>
                    <SelectItem value="duplicado">Duplicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
