// constants/requests.ts
export interface WorkflowStatus {
  id: string;
  name: { en: string; es: string };
  color: string;
  type: 'initial' | 'default' | 'final';
  positionX: number;
  positionY: number;
  description?: { en: string; es: string };
  isActive?: boolean;
}

export interface WorkflowTransition {
  id: string;
  label: { en: string; es: string };
  fromStatusId: string;
  toStatusId: string;
  maxDuration?: number;
  isDefault?: boolean;
  priority?: number;
  requiresApproval?: boolean;
  requiresJustification?: boolean;
}

export function getITILStatuses(): WorkflowStatus[] {
  return [
    {
      id: 'b08dfa3f-3769-416e-88cf-78809a29091e',
      name: { en: 'Draft', es: 'Borrador' },
      color: 'gray',
      type: 'initial',
      positionX: 207.5,
      positionY: 63.5,
      description: {
        en: 'Initial request registration',
        es: 'Registro inicial de la solicitud',
      },
      isActive: true,
    },
    {
      id: 'aa4edc6f-e444-4d00-915d-006e840241cf',
      name: { en: 'Review', es: 'En revisión' },
      color: 'blue',
      type: 'default',
      positionX: 190,
      positionY: 154.5,
      description: {
        en: 'Compliance activities evaluation',
        es: 'Evaluación de actividades de cumplimiento',
      },
      isActive: true,
    },
    {
      id: 'e29e89c0-abad-454b-9b45-0b87fc739253',
      name: { en: 'In Progress', es: 'En Progreso' },
      color: 'indigo',
      type: 'default',
      positionX: 128.48,
      positionY: 255.31,
      description: {
        en: 'Request fulfillment in process',
        es: 'La solicitud está en proceso de cumplimiento',
      },
      isActive: true,
    },
    {
      id: 'd1827d8a-1e83-45eb-8798-699f05ab2fcc',
      name: { en: 'Closed', es: 'Cerrado' },
      color: 'green',
      type: 'final',
      positionX: 61.52,
      positionY: 380.68,
      description: {
        en: 'Successfully completed and verified',
        es: 'Completado y verificado exitosamente',
      },
      isActive: false,
    },
    {
      id: '6f613584-27e7-4a48-baaa-d5c727213796',
      name: { en: 'Canceled', es: 'Cancelado' },
      color: 'red',
      type: 'final',
      positionX: 365.09,
      positionY: 361.12,
      description: {
        en: 'Request is no longer needed',
        es: 'La solicitud ya no es necesaria',
      },
      isActive: false,
    },
  ];
}

export function getITILTransitions(): WorkflowTransition[] {
  return [
    {
      id: '89b97b69-9b03-49dc-bcb6-d55f9d7046f8',
      label: { en: 'Submit', es: 'Enviar' },
      fromStatusId: 'b08dfa3f-3769-416e-88cf-78809a29091e',
      toStatusId: 'aa4edc6f-e444-4d00-915d-006e840241cf',
      maxDuration: 1440,
      isDefault: true,
      priority: 1,
    },
    {
      id: '412d347a-8562-476f-912b-bd7648be65c1',
      label: { en: 'Approve', es: 'Aprobar' },
      fromStatusId: 'aa4edc6f-e444-4d00-915d-006e840241cf',
      toStatusId: 'e29e89c0-abad-454b-9b45-0b87fc739253',
      maxDuration: 2880,
      requiresApproval: true,
      priority: 1,
    },
    {
      id: '3ba9e0d6-04e8-4dd1-9fc1-de2d1404b738',
      label: { en: 'Complete', es: 'Completar' },
      fromStatusId: 'e29e89c0-abad-454b-9b45-0b87fc739253',
      toStatusId: 'd1827d8a-1e83-45eb-8798-699f05ab2fcc',
      maxDuration: 10080,
      isDefault: true,
      priority: 1,
    },
    {
      id: '5662b214-0159-4870-bfa0-b4570cdf7839',
      label: { en: 'Cancel', es: 'Cancelar' },
      fromStatusId: 'e29e89c0-abad-454b-9b45-0b87fc739253',
      toStatusId: '6f613584-27e7-4a48-baaa-d5c727213796',
      maxDuration: 2880,
      priority: 2,
    },
  ];
}
