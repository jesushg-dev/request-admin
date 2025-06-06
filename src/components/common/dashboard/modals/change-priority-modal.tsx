'use client';

import type React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ChangePriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  currentPriority: string;
}

export function ChangePriorityModal({ isOpen, onClose, requestId, currentPriority }: ChangePriorityModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`La prioridad de la solicitud #${requestId} ha sido actualizada correctamente.`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cambiar prioridad</DialogTitle>
          <DialogDescription>Actualiza la prioridad de la solicitud #{requestId}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-priority">Prioridad actual</Label>
              <div className="text-sm text-muted-foreground">{currentPriority}</div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-priority">Nueva prioridad</Label>
              <Select required defaultValue="">
                <SelectTrigger id="new-priority">
                  <SelectValue placeholder="Selecciona la nueva prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Motivo del cambio (opcional)</Label>
              <Textarea id="reason" placeholder="Explica por qué se está cambiando la prioridad..." rows={3} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notify">Notificar al solicitante</Label>
              <Select required defaultValue="yes">
                <SelectTrigger id="notify">
                  <SelectValue placeholder="¿Notificar al solicitante?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Sí</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
