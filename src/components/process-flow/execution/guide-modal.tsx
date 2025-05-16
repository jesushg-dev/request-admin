'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Guide {
  id: string;
  title: string;
  description: string;
}

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedGuides: string[]) => void;
  stepName: string;
  initialSelectedGuides: string[];
}

export function GuideModal({ isOpen, onClose, onSave, stepName, initialSelectedGuides }: GuideModalProps) {
  // Lista de guías disponibles
  const availableGuides: Guide[] = [
    {
      id: 'manual-activacion',
      title: 'Manual de activación de servicios móviles',
      description: 'Guía completa sobre el proceso de activación de servicios móviles',
    },
    {
      id: 'verificacion-documentos',
      title: 'Verificación de documentos de identidad',
      description: 'Procedimiento para verificar la autenticidad de documentos de identidad',
    },
    {
      id: 'planes-corporativos',
      title: 'Planes corporativos disponibles',
      description: 'Catálogo de planes corporativos con detalles y precios',
    },
    {
      id: 'tutorial-sistema',
      title: 'Tutorial: Sistema de activaciones',
      description: 'Video tutorial sobre cómo usar el sistema de activaciones',
    },
    {
      id: 'politicas-seguridad',
      title: 'Políticas de seguridad',
      description: 'Políticas de seguridad para el manejo de información confidencial',
    },
    {
      id: 'procedimiento-escalacion',
      title: 'Procedimiento de escalación',
      description: 'Pasos a seguir para escalar incidencias o problemas',
    },
  ];

  // Estado para las guías seleccionadas
  const [selectedGuides, setSelectedGuides] = useState<string[]>(initialSelectedGuides);

  // Manejar cambio en la selección de guías
  const handleGuideChange = (guideId: string, checked: boolean) => {
    if (checked) {
      setSelectedGuides((prev) => [...prev, guideId]);
    } else {
      setSelectedGuides((prev) => prev.filter((id) => id !== guideId));
    }
  };

  // Guardar las guías seleccionadas
  const handleSave = () => {
    onSave(selectedGuides);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular guías</DialogTitle>
          <DialogDescription>Selecciona las guías que se deben consultar para este paso - {stepName}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {availableGuides.map((guide) => (
            <div key={guide.id} className="flex items-start space-x-2">
              <Checkbox id={guide.id} checked={selectedGuides.includes(guide.id)} onCheckedChange={(checked) => handleGuideChange(guide.id, checked as boolean)} />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor={guide.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {guide.title}
                </label>
                <p className="text-sm text-muted-foreground">{guide.description}</p>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSave}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
