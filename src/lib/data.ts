// Datos de ejemplo para notificaciones
export const notificationsData = [
  {
    id: 1,
    type: 'asignacion',
    title: 'Nueva solicitud asignada',
    description: 'Se te ha asignado la solicitud REQ-2023-010',
    date: new Date(Date.now() - 1000 * 60 * 10), // 10 minutos atrás
    read: false,
  },
  {
    id: 2,
    type: 'estado',
    title: 'Cambio de estado',
    description: "La solicitud REQ-2023-005 ha cambiado a 'En progreso'",
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
    read: false,
  },
  {
    id: 3,
    type: 'comentario',
    title: 'Nuevo comentario',
    description: 'María Rodríguez comentó en la solicitud REQ-2023-008',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
    read: false,
  },
  {
    id: 4,
    type: 'sistema',
    title: 'Mantenimiento programado',
    description: 'El sistema estará en mantenimiento el domingo a las 22:00',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 horas atrás
    read: true,
  },
  {
    id: 5,
    type: 'asignacion',
    title: 'Solicitud reasignada',
    description: 'La solicitud REQ-2023-003 ha sido reasignada a otro departamento',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
    read: true,
  },
  {
    id: 6,
    type: 'estado',
    title: 'Solicitud cerrada',
    description: 'La solicitud REQ-2023-001 ha sido cerrada',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 días atrás
    read: true,
  },
  {
    id: 7,
    type: 'asignacion',
    title: 'Nueva solicitud asignada',
    description: 'Se te ha asignado la solicitud REQ-2023-012',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 días atrás
    read: true,
  },
  {
    id: 8,
    type: 'comentario',
    title: 'Nuevo comentario',
    description: 'Juan Pérez comentó en la solicitud REQ-2023-007',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 días atrás
    read: true,
  },
  {
    id: 9,
    type: 'sistema',
    title: 'Actualización del sistema',
    description: 'Se ha actualizado el sistema a la versión 2.5.0',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 días atrás
    read: true,
  },
  {
    id: 10,
    type: 'estado',
    title: 'Solicitud en revisión',
    description: 'La solicitud REQ-2023-009 ha pasado a estado de revisión',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 días atrás
    read: true,
  },
  {
    id: 11,
    type: 'asignacion',
    title: 'Solicitud reasignada',
    description: 'La solicitud REQ-2023-004 ha sido reasignada a tu departamento',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 días atrás
    read: true,
  },
  {
    id: 12,
    type: 'comentario',
    title: 'Nuevo comentario',
    description: 'Ana García comentó en la solicitud REQ-2023-011',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8), // 8 días atrás
    read: true,
  },
];

export type NotificationType = 'all' | 'asignacion' | 'estado' | 'comentario' | 'sistema';

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'asignacion':
      return 'Asignación';
    case 'estado':
      return 'Estado';
    case 'comentario':
      return 'Comentario';
    case 'sistema':
      return 'Sistema';
    default:
      return 'Notificación';
  }
};

export const getNotificationColor = (type: string) => {
  switch (type) {
    case 'asignacion':
      return 'bg-blue-500';
    case 'estado':
      return 'bg-green-500';
    case 'comentario':
      return 'bg-yellow-500';
    case 'sistema':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};
