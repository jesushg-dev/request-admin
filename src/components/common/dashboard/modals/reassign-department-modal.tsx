'use client';

import type React from 'react';
import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface ReassignDepartmentModalProps {
  isOpen: boolean;
  currentDepartment?: string;
  onClose: () => void;
  requestId: string;
}

export function ReassignDepartmentModal({ isOpen, onClose, requestId }: ReassignDepartmentModalProps) {
  // Estado para la categoría de solicitud
  const [salesChannel, setSalesChannel] = useState('Grandes Empresas');
  const [serviceType, setServiceType] = useState('Cambio de plan');

  // Estado para la categoría de asignación
  const [area, setArea] = useState('Activaciones');
  const [requestType, setRequestType] = useState('Entrega Documentos Logistic');
  const [category, setCategory] = useState('Multimedia');
  const [subcategory, setSubcategory] = useState('Hfc Cable');

  // Estado para la notificación
  const [notifyOption, setNotifyOption] = useState('both');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Departamento reasignado', {
      description: `La solicitud #${requestId} ha sido reasignada a ${area} correctamente.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Reasignar a otro departamento</DialogTitle>
          <DialogDescription>Cambia el departamento asignado a la solicitud #{requestId}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Sección de Categoría de Solicitud */}
            <div>
              <h3 className="text-lg font-semibold mb-1">Categoría de Solicitud</h3>
              <p className="text-sm text-muted-foreground mb-3">Identifica la categoría de la solicitud proporcionando la información necesaria para su correcta gestión.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="sales-channel">Canal de Venta</Label>
                  <div className="relative">
                    <Select value={salesChannel} onValueChange={setSalesChannel}>
                      <SelectTrigger id="sales-channel" className="pr-8">
                        <SelectValue placeholder="Selecciona el canal de venta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grandes Empresas">Grandes Empresas</SelectItem>
                        <SelectItem value="Pymes">Pymes</SelectItem>
                        <SelectItem value="Residencial">Residencial</SelectItem>
                        <SelectItem value="Gobierno">Gobierno</SelectItem>
                      </SelectContent>
                    </Select>
                    {salesChannel && (
                      <Button type="button" variant="ghost" size="icon" className="absolute right-8 top-0 h-full" onClick={() => setSalesChannel('')}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Selecciona el canal de venta</p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="service-type">Tipo de Servicio</Label>
                  <div className="relative">
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger id="service-type" className="pr-8">
                        <SelectValue placeholder="Selecciona el tipo de servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cambio de plan">Cambio de plan</SelectItem>
                        <SelectItem value="Nueva contratación">Nueva contratación</SelectItem>
                        <SelectItem value="Renovación">Renovación</SelectItem>
                        <SelectItem value="Cancelación">Cancelación</SelectItem>
                      </SelectContent>
                    </Select>
                    {serviceType && (
                      <Button type="button" variant="ghost" size="icon" className="absolute right-8 top-0 h-full" onClick={() => setServiceType('')}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Selecciona el tipo de servicio</p>
                </div>
              </div>
            </div>

            <Separator className="my-1" />

            {/* Sección de Categoría de Asignación */}
            <div>
              <h3 className="text-lg font-semibold mb-1">Categoría de Asignación</h3>
              <p className="text-sm text-muted-foreground mb-3">Esto permitirá la correcta asignación de recursos y la adecuada distribución de la solicitud.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="area">Área</Label>
                  <div className="relative">
                    <Select value={area} onValueChange={setArea}>
                      <SelectTrigger id="area" className="pr-8">
                        <SelectValue placeholder="Selecciona el área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activaciones">Activaciones</SelectItem>
                        <SelectItem value="Comisiones">Comisiones</SelectItem>
                        <SelectItem value="Soporte">Soporte</SelectItem>
                        <SelectItem value="Facturación">Facturación</SelectItem>
                      </SelectContent>
                    </Select>
                    {area && (
                      <Button type="button" variant="ghost" size="icon" className="absolute right-8 top-0 h-full" onClick={() => setArea('')}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Selecciona el área donde se asignará la solicitud</p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="request-type">Tipo de Solicitud</Label>
                  <div className="relative">
                    <Select value={requestType} onValueChange={setRequestType}>
                      <SelectTrigger id="request-type" className="pr-8">
                        <SelectValue placeholder="Selecciona el tipo de solicitud" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entrega Documentos Logistic">Entrega Documentos Logistic</SelectItem>
                        <SelectItem value="Activación de Servicio">Activación de Servicio</SelectItem>
                        <SelectItem value="Cambio de Equipo">Cambio de Equipo</SelectItem>
                        <SelectItem value="Soporte Técnico">Soporte Técnico</SelectItem>
                      </SelectContent>
                    </Select>
                    {requestType && (
                      <Button type="button" variant="ghost" size="icon" className="absolute right-8 top-0 h-full" onClick={() => setRequestType('')}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Selecciona el tipo de solicitud</p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="category">Categoría</Label>
                  <div className="relative">
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category" className="pr-8">
                        <SelectValue placeholder="Selecciona la categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Multimedia">Multimedia</SelectItem>
                        <SelectItem value="Internet">Internet</SelectItem>
                        <SelectItem value="Telefonía">Telefonía</SelectItem>
                        <SelectItem value="Televisión">Televisión</SelectItem>
                      </SelectContent>
                    </Select>
                    {category && (
                      <Button type="button" variant="ghost" size="icon" className="absolute right-8 top-0 h-full" onClick={() => setCategory('')}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Selecciona la categoría</p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="subcategory">Subcategoría</Label>
                  <div className="relative">
                    <Select value={subcategory} onValueChange={setSubcategory}>
                      <SelectTrigger id="subcategory" className="pr-8">
                        <SelectValue placeholder="Selecciona la subcategoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hfc Cable">Hfc Cable</SelectItem>
                        <SelectItem value="Fibra Óptica">Fibra Óptica</SelectItem>
                        <SelectItem value="Satelital">Satelital</SelectItem>
                        <SelectItem value="Inalámbrico">Inalámbrico</SelectItem>
                      </SelectContent>
                    </Select>
                    {subcategory && (
                      <Button type="button" variant="ghost" size="icon" className="absolute right-8 top-0 h-full" onClick={() => setSubcategory('')}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Selecciona la subcategoría</p>
                </div>
              </div>
            </div>

            <Separator className="my-1" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="reason">Motivo de la reasignación</Label>
                <Textarea id="reason" placeholder="Explica por qué se está reasignando esta solicitud..." rows={2} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="notify">Notificar a</Label>
                <Select value={notifyOption} onValueChange={setNotifyOption}>
                  <SelectTrigger id="notify">
                    <SelectValue placeholder="Selecciona a quién notificar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requester">Solo al solicitante</SelectItem>
                    <SelectItem value="department">Solo al nuevo departamento</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Reasignar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
