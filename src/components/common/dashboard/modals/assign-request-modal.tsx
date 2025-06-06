'use client';

import type React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const users = [
  { id: '1', name: 'Carlos Mendoza', department: 'Activaciones' },
  { id: '2', name: 'Ana Castillo', department: 'Comisiones' },
  { id: '3', name: 'Roberto Jiménez', department: 'Soporte' },
  { id: '4', name: 'Luis Morales', department: 'Facturación' },
  { id: '5', name: 'María Rodríguez', department: 'Activaciones' },
  { id: '6', name: 'Juan López', department: 'Soporte' },
];

interface AssignRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  department: string;
  currentAssignee?: string;
}

export function AssignRequestModal({ isOpen, onClose, requestId, department, currentAssignee }: AssignRequestModalProps) {
  const departmentUsers = users.filter((user) => user.department === department);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`La solicitud #${requestId} ha sido asignada correctamente.`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Asignar solicitud</DialogTitle>
          <DialogDescription>Asigna la solicitud #{requestId} a un usuario</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="department">Departamento</Label>
              <div className="text-sm text-muted-foreground">{department}</div>
            </div>
            {currentAssignee && (
              <div className="grid gap-2">
                <Label htmlFor="current-assignee">Asignado actualmente a</Label>
                <div className="text-sm text-muted-foreground">{currentAssignee}</div>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="new-assignee">Asignar a</Label>
              <Select required defaultValue="">
                <SelectTrigger id="new-assignee">
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {departmentUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comments">Comentarios (opcional)</Label>
              <Textarea id="comments" placeholder="Añade un comentario sobre la asignación..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Asignar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
