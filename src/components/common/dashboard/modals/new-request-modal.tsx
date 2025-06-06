'use client';

import type React from 'react';
import { useState } from 'react';
import { Info } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewRequestModal({ isOpen, onClose }: NewRequestModalProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const departmentRequirements: Record<string, string[]> = {
    activaciones: ['Nombre completo del cliente', 'Número de identificación', 'Plan seleccionado', 'Documentación de respaldo adjunta'],
    comisiones: ['Período de comisión reclamado', 'Monto esperado', 'Detalle de ventas realizadas', 'Código de vendedor'],
    soporte: ['Descripción detallada del problema', 'Número de servicio afectado', 'Acciones ya intentadas', 'Fecha de inicio del problema'],
    facturacion: ['Número de factura', 'Monto en disputa', 'Razón del reclamo', 'Comprobantes de pago (si aplica)'],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Tu solicitud ha sido creada exitosamente y está en estado de borrador.', {
      description: 'Solicitud creada',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud</DialogTitle>
          <DialogDescription>Completa todos los campos requeridos para crear tu solicitud</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título de la solicitud</Label>
              <Input id="title" placeholder="Ingresa un título descriptivo" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">Departamento</Label>
              <Select onValueChange={(value) => setSelectedDepartment(value)} required>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Selecciona un departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activaciones">Activaciones</SelectItem>
                  <SelectItem value="comisiones">Comisiones</SelectItem>
                  <SelectItem value="soporte">Soporte</SelectItem>
                  <SelectItem value="facturacion">Facturación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="priority">Prioridad</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Información sobre prioridades</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Alta: Requiere atención inmediata</p>
                      <p>Media: Atención en 24-48 horas</p>
                      <p>Baja: Atención en 3-5 días</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select defaultValue="media" required>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Selecciona la prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" placeholder="Describe detalladamente tu solicitud..." rows={5} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="attachments">Adjuntos (opcional)</Label>
              <Input id="attachments" type="file" multiple />
              <p className="text-xs text-muted-foreground">Puedes adjuntar hasta 5 archivos (máx. 10MB cada uno)</p>
            </div>

            {selectedDepartment && (
              <div className="mt-4 rounded-md bg-yellow-50 p-4 border border-yellow-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Requisitos para este departamento</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc pl-5 space-y-1">{departmentRequirements[selectedDepartment]?.map((requirement, index) => <li key={index}>{requirement}</li>)}</ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Crear solicitud</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
