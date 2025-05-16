'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Añadir la interfaz para las guías
interface Guide {
  id: string;
  title: string;
  description: string;
}

// Definir una interfaz para los datos del nodo
interface NodeData {
  label: string;
  action?: string;
  responsible?: string;
  estimatedTime?: number;
  timeUnit?: string;
  expression?: string;
  condition?: string;
  maxIterations?: number;
  processRef?: string;
  type?: string;
  details?: string;
  approvers?: string[];
  channel?: string;
  message?: string;
  duration?: number;
  linkedGuides?: string[];
  text?: string;
  [key: string]: unknown;
}

// Definir una interfaz para el nodo
interface FlowNode {
  id: string;
  type?: string;
  data: NodeData;
  position: { x: number; y: number };
  style?: Record<string, unknown>;
}

// Actualizar la interfaz PropertiesPanelProps
interface PropertiesPanelProps {
  node: FlowNode;
  onChange: (nodeId: string, data: NodeData) => void;
  onClose: () => void;
  onDelete: () => void;
}

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

// Modificar la función PropertiesPanel para incluir el manejo de guías
export default function PropertiesPanel({ node, onChange, onClose, onDelete }: PropertiesPanelProps) {
  const [formData, setFormData] = useState<NodeData>(node.data);
  const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
  const [selectedGuides, setSelectedGuides] = useState<string[]>(node.data.linkedGuides || []);

  useEffect(() => {
    setFormData(node.data);
    setSelectedGuides(node.data.linkedGuides || []);
  }, [node]);

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev: NodeData) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(node.id, formData);
  };

  // Manejar cambio en la selección de guías
  const handleGuideChange = (guideId: string, checked: boolean) => {
    if (checked) {
      setSelectedGuides((prev) => [...prev, guideId]);
    } else {
      setSelectedGuides((prev) => prev.filter((id) => id !== guideId));
    }
  };

  // Guardar las guías seleccionadas
  const handleSaveGuides = () => {
    handleChange('linkedGuides', selectedGuides);
    setIsGuideDialogOpen(false);
  };

  // Añadir la sección de guías vinculadas al renderFormFields
  const renderGuidesSection = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Guías vinculadas</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => setIsGuideDialogOpen(true)}>
            <Link className="w-4 h-4 mr-2" /> Vincular guías
          </Button>
        </div>
        <div className="border rounded p-2 min-h-[60px] bg-gray-50">
          {selectedGuides.length > 0 ? (
            <ul className="space-y-1">
              {selectedGuides.map((guideId) => {
                const guide = availableGuides.find((g) => g.id === guideId);
                return guide ? (
                  <li key={guideId} className="text-sm">
                    • {guide.title}
                  </li>
                ) : null;
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">No hay guías vinculadas</p>
          )}
        </div>
      </div>
    );
  };

  // Modificar renderFormFields para incluir la sección de guías
  const renderFormFields = () => {
    const formFields = (() => {
      switch (node.type) {
        case 'start':
        case 'end':
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={formData.label || ''} onChange={(e) => handleChange('label', e.target.value)} />
              </div>
            </div>
          );

        case 'step':
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={formData.label || ''} onChange={(e) => handleChange('label', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Textarea id="action" value={formData.action || ''} onChange={(e) => handleChange('action', e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsible</Label>
                <Input id="responsible" value={formData.responsible || ''} onChange={(e) => handleChange('responsible', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Estimated Time</Label>
                  <Input id="estimatedTime" type="number" value={formData.estimatedTime || 0} onChange={(e) => handleChange('estimatedTime', Number(e.target.value))} min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeUnit">Time Unit</Label>
                  <Select value={formData.timeUnit || 'minutes'} onValueChange={(value) => handleChange('timeUnit', value)}>
                    <SelectTrigger id="timeUnit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sla">SLA (hours)</Label>
                <Input id="sla" type="number" value={formData.sla ? String(formData.sla) : ''} onChange={(e) => handleChange('sla', Number(e.target.value))} min="0" />
              </div>
              {renderGuidesSection()}
            </div>
          );

        case 'condition':
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={formData.label || ''} onChange={(e) => handleChange('label', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expression">Expression</Label>
                <Textarea id="expression" value={formData.expression || ''} onChange={(e) => handleChange('expression', e.target.value)} rows={3} placeholder="e.g., request.priority > 3" />
              </div>
              {renderGuidesSection()}
            </div>
          );

        case 'loop':
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={formData.label || ''} onChange={(e) => handleChange('label', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Textarea id="condition" value={formData.condition || ''} onChange={(e) => handleChange('condition', e.target.value)} rows={3} placeholder="e.g., index < items.length" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxIterations">Max Iterations</Label>
                <Input id="maxIterations" type="number" value={formData.maxIterations || 10} onChange={(e) => handleChange('maxIterations', Number(e.target.value))} min="1" />
              </div>
              {renderGuidesSection()}
            </div>
          );

        case 'subprocess':
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={formData.label || ''} onChange={(e) => handleChange('label', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="processRef">Process Reference</Label>
                <Input id="processRef" value={formData.processRef || ''} onChange={(e) => handleChange('processRef', e.target.value)} placeholder="Process ID or name" />
              </div>
              {renderGuidesSection()}
            </div>
          );

        case 'task':
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={formData.label || ''} onChange={(e) => handleChange('label', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Task Type</Label>
                <Select value={formData.type || 'manual'} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="rpa">RPA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="details">Details</Label>
                <Textarea id="details" value={formData.details || ''} onChange={(e) => handleChange('details', e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Estimated Time</Label>
                  <Input id="estimatedTime" type="number" value={formData.estimatedTime || 0} onChange={(e) => handleChange('estimatedTime', Number(e.target.value))} min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeUnit">Time Unit</Label>
                  <Select value={formData.timeUnit || 'minutes'} onValueChange={(value) => handleChange('timeUnit', value)}>
                    <SelectTrigger id="timeUnit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {renderGuidesSection()}
            </div>
          );

        case 'approval':
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={formData.label || ''} onChange={(e) => handleChange('label', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approvers">Approvers (comma separated)</Label>
                <Input
                  id="approvers"
                  value={Array.isArray(formData.approvers) ? formData.approvers.join(', ') : ''}
                  onChange={(e) => {
                    const approvers = e.target.value
                      .split(',')
                      .map((item: string) => item.trim())
                      .filter(Boolean);
                    handleChange('approvers', approvers);
                  }}
                  placeholder="e.g., Manager, Team Lead"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Estimated Time</Label>
                  <Input id="estimatedTime" type="number" value={formData.estimatedTime || 0} onChange={(e) => handleChange('estimatedTime', Number(e.target.value))} min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeUnit">Time Unit</Label>
                  <Select value={formData.timeUnit || 'minutes'} onValueChange={(value) => handleChange('timeUnit', value)}>
                    <SelectTrigger id="timeUnit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {renderGuidesSection()}
            </div>
          );

        case 'notification':
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={formData.label || ''} onChange={(e) => handleChange('label', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <Select value={formData.channel || 'email'} onValueChange={(value) => handleChange('channel', value)}>
                  <SelectTrigger id="channel">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="alert">System Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" value={formData.message || ''} onChange={(e) => handleChange('message', e.target.value)} rows={3} />
              </div>
              {renderGuidesSection()}
            </div>
          );

        case 'timer':
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={formData.label || ''} onChange={(e) => handleChange('label', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input id="duration" type="number" value={formData.duration || 0} onChange={(e) => handleChange('duration', Number(e.target.value))} min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeUnit">Time Unit</Label>
                  <Select value={formData.timeUnit || 'minutes'} onValueChange={(value) => handleChange('timeUnit', value)}>
                    <SelectTrigger id="timeUnit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seconds">Seconds</SelectItem>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {renderGuidesSection()}
            </div>
          );

        case 'gateway':
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={formData.label || ''} onChange={(e) => handleChange('label', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Gateway Type</Label>
                <Select value={formData.type || 'parallel'} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parallel">Parallel</SelectItem>
                    <SelectItem value="inclusive">Inclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {renderGuidesSection()}
            </div>
          );

        case 'message':
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={formData.label || ''} onChange={(e) => handleChange('label', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" value={formData.message || ''} onChange={(e) => handleChange('message', e.target.value)} rows={3} />
              </div>
              {renderGuidesSection()}
            </div>
          );

        case 'annotation':
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={formData.label || ''} onChange={(e) => handleChange('label', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="text">Text</Label>
                <Textarea id="text" value={formData.text || ''} onChange={(e) => handleChange('text', e.target.value)} rows={5} />
              </div>
              {renderGuidesSection()}
            </div>
          );

        default:
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={formData.label || ''} onChange={(e) => handleChange('label', e.target.value)} />
              </div>
              {renderGuidesSection()}
            </div>
          );
      }
    })();

    return formFields;
  };

  return (
    <div className="w-72 overflow-hidden flex flex-col h-full border-l bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Properties: {node.type}</h2>
        <Button type="button" variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex-1 overflow-auto">{renderFormFields()}</div>
          <div className="flex gap-4 justify-between w-full p-4 pt-2">
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button type="button" size="sm" onClick={handleSubmit}>
              Apply
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={isGuideDialogOpen} onOpenChange={setIsGuideDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular guías</DialogTitle>
            <DialogDescription>Selecciona las guías que se deben consultar para este paso - {formData.label}</DialogDescription>
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
            <Button type="button" variant="outline" onClick={() => setIsGuideDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveGuides}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
