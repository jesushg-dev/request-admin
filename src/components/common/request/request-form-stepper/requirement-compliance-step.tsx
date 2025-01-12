'use client';

import { Check, X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Datos simulados para los requisitos
const mockRequirements = [
  {
    id: 'req1',
    title: 'Carta de empresas hermanas o correo',
    description: 'Documentación que acredita la relación entre empresas hermanas o comunicación oficial relativa a la prestación de servicios.',
    completed: false,
  },
  {
    id: 'req2',
    title: 'Documento de Identidad vigente',
    description: 'Identificación oficial vigente del titular del servicio, requerida para verificación legal y contractual.',
    completed: false,
  },
  {
    id: 'req3',
    title: 'Cliente sin mora y CD',
    description: 'Verificación del estado de cuenta del cliente para asegurar que no existen moras y que cumple con los requisitos de crédito y deuda.',
    completed: true,
  },
  {
    id: 'req4',
    title: 'Memo firmado GC',
    description: 'Memorando firmado por la Gerencia Comercial en casos de excepciones a ofertas estándar, incluyendo planes, rentas y otros.',
    completed: true,
  },
  {
    id: 'req5',
    title: 'Contrato',
    description: 'Documento oficial que establece los términos de servicio entre el proveedor y el cliente.',
    completed: false,
  },
  {
    id: 'req6',
    title: 'Carta de solicitud del representante legal',
    description: 'Documento formal presentado por el representante legal solicitando algún servicio o acción específica.',
    completed: false,
  },
];

export default function RequirementComplianceStep() {
  const { watch, setValue } = useFormContext();
  const documents = watch('documents') || {};
  const requirementCompliance = watch('requirementCompliance') || {};

  const handleCheckboxChange = (requirementId: string, checked: boolean) => {
    setValue(`requirementCompliance.${requirementId}`, checked);
  };

  const handleSelectAll = () => {
    const allChecked = mockRequirements.every((req) => requirementCompliance[req.id] || req.completed);

    mockRequirements.forEach((req) => {
      if (!req.completed) {
        setValue(`requirementCompliance.${req.id}`, !allChecked);
      }
    });
  };

  const handleFileUpload = (requirementId: string, file: File) => {
    setValue(`documents.${requirementId}`, file);
  };

  const handleRemoveFile = (requirementId: string) => {
    setValue(`documents.${requirementId}`, undefined);
  };

  return (
    <div className="mx-1 mr-4 flex flex-col gap-2">
      <div className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold">Requirements ({mockRequirements.length})</h3>
        <Button variant="outline" size="sm" onClick={handleSelectAll}>
          Select All
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {mockRequirements.map((requirement) => (
          <div key={requirement.id} className={`flex space-x-4 rounded-lg border p-4 ${requirement.completed ? 'bg-muted' : ''}`}>
            <Checkbox
              id={requirement.id}
              checked={requirementCompliance[requirement.id] || requirement.completed}
              onCheckedChange={(checked) => handleCheckboxChange(requirement.id, checked as boolean)}
              disabled={requirement.completed}
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <Label htmlFor={requirement.id} className={`font-medium ${requirement.completed ? 'text-muted-foreground' : ''}`}>
                {requirement.title}
              </Label>
              <p className="text-sm text-muted-foreground">{requirement.description}</p>
              {!requirement.completed && (
                <div className="mt-2">
                  <Label htmlFor={`file-${requirement.id}`} className="text-sm">
                    Upload Document
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      id={`file-${requirement.id}`}
                      type="file"
                      className="max-w-xs"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(requirement.id, file);
                      }}
                    />
                    {documents[requirement.id] && (
                      <Button variant="outline" size="icon" onClick={() => handleRemoveFile(requirement.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {documents[requirement.id] && <p className="mt-1 text-sm text-muted-foreground">File uploaded: {documents[requirement.id].name}</p>}
                </div>
              )}
            </div>
            {requirement.completed && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
