import { STATUS } from '@/constants/requests';

export function getITILStatuses() {
  const itilStates = [
    {
      name: { en: 'Draft', es: 'Borrador' },
      itilCode: 'draft',
      level: STATUS.DRAFT,
      description: {
        en: 'Initial request registration',
        es: 'Registro inicial de la solicitud',
      },
      isActive: true,
      isFinal: false,
      requiresApproval: false,
    },
    {
      name: { en: 'Review', es: 'En revisión' },
      itilCode: 'review',
      level: STATUS.REVIEW,
      description: {
        en: 'Compliance activities evaluation',
        es: 'Evaluación de actividades de cumplimiento',
      },
      isActive: true,
      isFinal: false,
      requiresApproval: true,
    },
    {
      name: { en: 'Canceled', es: 'Cancelado' },
      itilCode: 'canceled',
      level: STATUS.CANCELED,
      description: {
        en: 'Request is no longer needed',
        es: 'La solicitud ya no es necesaria',
      },
      isActive: false,
      isFinal: true,
      requiresApproval: false,
    },
    {
      name: { en: 'In Progress', es: 'En progreso' },
      itilCode: 'in_progress',
      level: STATUS.IN_PROGRESS,
      description: {
        en: 'Request fulfillment in process',
        es: 'La solicitud está en proceso de cumplimiento',
      },
      isActive: true,
      isFinal: false,
      requiresApproval: false,
    },
    {
      name: { en: 'Closed', es: 'Cerrado' },
      itilCode: 'closed',
      level: STATUS.CLOSED,
      description: {
        en: 'Successfully completed and verified',
        es: 'Completado y verificado exitosamente',
      },
      isActive: false,
      isFinal: true,
      requiresApproval: false,
    },
  ];

  return itilStates;
}

export function getITILTransitions() {
  const itilTransitions = [
    {
      fromCode: 'draft',
      toCode: 'review',
      maxDuration: 1440,
      isDefault: true,
      priority: 1,
      description: {
        en: 'Submit for review',
        es: 'Enviar para revisión',
      },
    },
    {
      fromCode: 'draft',
      toCode: 'canceled',
      priority: 2,
      description: {
        en: 'Cancel draft request',
        es: 'Cancelar solicitud en borrador',
      },
    },
    {
      fromCode: 'review',
      toCode: 'draft',
      priority: 2,
      description: {
        en: 'Return for modifications',
        es: 'Devolver para modificaciones',
      },
    },
    {
      fromCode: 'review',
      toCode: 'in_progress',
      maxDuration: 2880,
      requiresApproval: true,
      priority: 1,
      description: {
        en: 'Approve for implementation',
        es: 'Aprobar para implementación',
      },
    },
    {
      fromCode: 'review',
      toCode: 'canceled',
      priority: 3,
      description: {
        en: 'Cancel during review',
        es: 'Cancelar durante revisión',
      },
    },
    {
      fromCode: 'in_progress',
      toCode: 'closed',
      maxDuration: 10080,
      isDefault: true,
      description: {
        en: 'Complete implementation',
        es: 'Completar implementación',
      },
    },
    {
      fromCode: 'in_progress',
      toCode: 'canceled',
      description: {
        en: 'Cancel during implementation',
        es: 'Cancelar durante implementación',
      },
    },
  ];

  return itilTransitions;
}
