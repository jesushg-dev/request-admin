import { Locale } from 'next-intl';

import { FlowNodeType } from '@/types/execution-flow';

export const nodeLabels: Record<Locale, Record<FlowNodeType, string>> = {
  es: {
    start: 'Inicio',
    end: 'Fin',
    step: 'Paso',
    task: 'Tarea',
    approval: 'Aprobación',
    timer: 'Temporizador',
    condition: 'Condición',
    loop: 'Bucle',
    subprocess: 'Subproceso',
    notification: 'Notificación',
    gateway: 'Gateway',
    message: 'Evento de Mensaje',
    annotation: 'Anotación',
  },
  en: {
    start: 'Start',
    end: 'End',
    step: 'Step',
    task: 'Task',
    approval: 'Approval',
    timer: 'Timer',
    condition: 'Condition',
    loop: 'Loop',
    subprocess: 'Subprocess',
    notification: 'Notification',
    gateway: 'Gateway',
    message: 'Message Event',
    annotation: 'Annotation',
  },
};

export const edgeLabels: Record<Locale, Record<string, string>> = {
  es: {
    yes: 'Sí',
    no: 'No',
    approve: 'Aprobado',
    reject: 'Rechazado',
    success: 'Éxito',
    error: 'Error',
  },
  en: {
    yes: 'Yes',
    no: 'No',
    approve: 'Approved',
    reject: 'Rejected',
    success: 'Success',
    error: 'Error',
  },
};

export const getApprovalBadgeClass = ({ isActive, isCompleted, isBlocked }: { isActive?: boolean; isCompleted?: boolean; isBlocked?: boolean }) => {
  if (isActive) {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100 hover:bg-emerald-200 dark:hover:bg-emerald-700 transition-colors';
  }
  if (isCompleted) {
    return 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100';
  }
  if (isBlocked) {
    return 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
  return '';
};
