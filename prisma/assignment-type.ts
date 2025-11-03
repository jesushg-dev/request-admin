import { AssignmentTypeEnum } from '@/constants/assignment-type';

export function getITILAssignmentTypes() {
  // Usando el ENUM y las nuevas descripciones detalladas
  const assignmentTypes = [
    {
      name: 'Incident Assignment',
      system_name: AssignmentTypeEnum.INCIDENT,
      description:
        'Asignación de tareas relacionadas con la resolución de incidentes en los sistemas de TI. Implica la atención y gestión de interrupciones o fallos en los servicios que afectan a los usuarios o a los procesos críticos del negocio.',
      isActive: true,
    },
    {
      name: 'Problem Assignment',
      system_name: AssignmentTypeEnum.PROBLEM,
      description:
        'Asignación de tareas centradas en la identificación y resolución de causas raíz de problemas recurrentes. Este proceso busca evitar que los incidentes se repitan mediante la implementación de soluciones permanentes.',
      isActive: true,
    },
    {
      name: 'Service Request Assignment',
      system_name: AssignmentTypeEnum.SERVICE_REQUEST,
      description:
        'Asignación de tareas asociadas con solicitudes de servicio estándar, como acceso a aplicaciones, servicios o recursos de infraestructura. Se gestionan según procedimientos establecidos para brindar soporte a usuarios finales.',
      isActive: true,
    },
    {
      name: 'Change Assignment',
      system_name: AssignmentTypeEnum.CHANGE,
      description:
        'Asignación de tareas relacionadas con la implementación de cambios en la infraestructura, aplicaciones o procesos de TI. El objetivo es gestionar las modificaciones de manera controlada y minimizar el impacto en los servicios existentes.',
      isActive: true,
    },
    {
      name: 'Release Assignment',
      system_name: AssignmentTypeEnum.RELEASE,
      description:
        'Asignación de tareas vinculadas a la planificación, prueba y despliegue de nuevas versiones de software o actualizaciones. Este proceso asegura que las nuevas funcionalidades se entreguen sin interrumpir los servicios en producción.',
      isActive: true,
    },
  ];

  return assignmentTypes;
}
