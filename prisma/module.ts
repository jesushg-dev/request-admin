import { ModuleName, PermissionActions } from '../src/constants/permissions';

export type ModuleScope = 'global' | 'area';

// Strictly type a feature to ensure its `action` matches the correct `PermissionActions` structure
type ModuleFeature<M extends keyof typeof PermissionActions> = {
  action: (typeof PermissionActions)[M][keyof (typeof PermissionActions)[M]]; // Action must exist in PermissionActions
  name: { es: string; en: string };
  description: { es: string; en: string };
  scope: ModuleScope;
};

// Define the module structure
type ModuleDefinition<M extends keyof typeof PermissionActions> = {
  name: { es: string; en: string };
  description: { es: string; en: string };
  features: Record<keyof (typeof PermissionActions)[M], ModuleFeature<M>>; // Keys must match PermissionActions
};

// Define the full structure for all modules
type PrismaModulesDefinition = {
  [M in keyof typeof ModuleName]: ModuleDefinition<M>;
};

// Final PrismaModules object with strict validation
export const PrismaModules: PrismaModulesDefinition = {
  REQUEST_MANAGEMENT: {
    name: {
      en: ModuleName.REQUEST_MANAGEMENT,
      es: 'Gestión de solicitudes',
    },
    description: {
      en: 'Module to manage the entire lifecycle of requests, from creation to assignment and tracking',
      es: 'Módulo para gestionar todo el ciclo de vida de las solicitudes, desde su creación hasta la asignación y seguimiento',
    },
    features: {
      CREATE: {
        action: PermissionActions.REQUEST_MANAGEMENT.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new requests in the system',
          es: 'Permiso para crear nuevas solicitudes en el sistema',
        },
        scope: 'global',
      },
      SCOPED_CREATE: {
        action: PermissionActions.REQUEST_MANAGEMENT.SCOPED_CREATE,
        name: { en: 'Scoped Create', es: 'Crear en área' },
        description: {
          en: 'Permission to create new requests within a specific area',
          es: 'Permiso para crear nuevas solicitudes dentro de un área específica',
        },
        scope: 'area',
      },
      VIEW: {
        action: PermissionActions.REQUEST_MANAGEMENT.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view registered requests in the system',
          es: 'Permiso para consultar las solicitudes registradas en el sistema',
        },
        scope: 'global',
      },
      SCOPED_VIEW: {
        action: PermissionActions.REQUEST_MANAGEMENT.SCOPED_VIEW,
        name: { en: 'Scoped View', es: 'Ver en área' },
        description: {
          en: 'Permission to view requests within a specific area',
          es: 'Permiso para consultar solicitudes dentro de un área específica',
        },
        scope: 'area',
      },
      EDIT: {
        action: PermissionActions.REQUEST_MANAGEMENT.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit data or information of existing requests',
          es: 'Permiso para modificar datos o información de las solicitudes existentes',
        },
        scope: 'global',
      },
      SCOPED_EDIT: {
        action: PermissionActions.REQUEST_MANAGEMENT.SCOPED_EDIT,
        name: { en: 'Scoped Edit', es: 'Editar en área' },
        description: {
          en: 'Permission to edit requests within a specific area',
          es: 'Permiso para modificar solicitudes dentro de un área específica',
        },
        scope: 'area',
      },
      DISABLE: {
        action: PermissionActions.REQUEST_MANAGEMENT.DISABLE,
        name: { en: 'Disable', es: 'Inhabilitar' },
        description: {
          en: 'Permission to disable existing requests in the system',
          es: 'Permiso para inhabilitar solicitudes existentes en el sistema',
        },
        scope: 'global',
      },
      SCOPED_DISABLE: {
        action: PermissionActions.REQUEST_MANAGEMENT.SCOPED_DISABLE,
        name: { en: 'Scoped Disable', es: 'Inhabilitar en área' },
        description: {
          en: 'Permission to disable requests within a specific area',
          es: 'Permiso para inhabilitar solicitudes dentro de un área específica',
        },
        scope: 'area',
      },
      ASSIGN_USER: {
        action: PermissionActions.REQUEST_MANAGEMENT.ASSIGN_USER,
        name: { en: 'Assign', es: 'Asignar' },
        description: {
          en: 'Permission to assign users to requests within a specific area',
          es: 'Permiso para asignar responsables a solicitudes dentro de un área específica',
        },
        scope: 'global',
      },
      SCOPED_ASSIGN_USER: {
        action: PermissionActions.REQUEST_MANAGEMENT.SCOPED_ASSIGN_USER,
        name: { en: 'Scoped Assign', es: 'Asignar en área' },
        description: {
          en: 'Permission to assign users to requests within a specific area',
          es: 'Permiso para asignar responsables a solicitudes dentro de un área específica',
        },
        scope: 'area',
      },
      SCOPED_SET_PRIORITY: {
        action: PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_PRIORITY,
        name: { en: 'Set Priority', es: 'Establecer prioridad' },
        description: {
          en: 'Permission to set the priority of requests within an area',
          es: 'Permiso para definir la prioridad de las solicitudes dentro de un área',
        },
        scope: 'area',
      },
      SCOPED_SET_STATUS: {
        action: PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_STATUS,
        name: { en: 'Set Status', es: 'Establecer estado' },
        description: {
          en: 'Permission to set the status of requests within an area',
          es: 'Permiso para definir el estado de las solicitudes dentro de un área',
        },
        scope: 'area',
      },
      SCOPED_SEND_DOCUMENTS: {
        action: PermissionActions.REQUEST_MANAGEMENT.SCOPED_SEND_DOCUMENTS,
        name: { en: 'Send Documents', es: 'Enviar documentos' },
        description: {
          en: 'Permission to upload or send documents related to requests within a specific area',
          es: 'Permiso para subir o enviar documentos relacionados a solicitudes dentro de un área específica',
        },
        scope: 'area',
      },
    },
  },
  FORM_DESIGNER: {
    name: {
      en: ModuleName.FORM_DESIGNER,
      es: 'Diseñador de Formularios',
    },
    description: {
      en: 'Module for designing, managing, and publishing custom forms',
      es: 'Módulo para diseñar, gestionar y publicar formularios personalizados',
    },
    features: {
      CREATE: {
        action: PermissionActions.FORM_DESIGNER.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new custom forms',
          es: 'Permiso para crear nuevos formularios personalizados',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.FORM_DESIGNER.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view existing forms',
          es: 'Permiso para consultar formularios existentes',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.FORM_DESIGNER.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing forms',
          es: 'Permiso para modificar formularios existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.FORM_DESIGNER.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete existing forms',
          es: 'Permiso para eliminar formularios existentes',
        },
        scope: 'global',
      },
      PUBLISH: {
        action: PermissionActions.FORM_DESIGNER.PUBLISH,
        name: { en: 'Publish', es: 'Publicar' },
        description: {
          en: 'Permission to publish forms and set them live',
          es: 'Permiso para publicar formularios y ponerlos en producción',
        },
        scope: 'global',
      },
    },
  },
  REQUIREMENT_TYPE: {
    name: {
      en: ModuleName.REQUIREMENT_TYPE,
      es: 'Tipos de Requerimientos',
    },
    description: {
      en: 'Module to manage the different types of system requirements',
      es: 'Módulo para gestionar los diferentes tipos de requerimientos del sistema',
    },
    features: {
      CREATE: {
        action: PermissionActions.REQUIREMENT_TYPE.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new requirement types',
          es: 'Permiso para crear nuevos tipos de requerimientos',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.REQUIREMENT_TYPE.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view existing requirement types',
          es: 'Permiso para consultar los tipos de requerimientos existentes',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.REQUIREMENT_TYPE.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing requirement types',
          es: 'Permiso para modificar los tipos de requerimientos existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.REQUIREMENT_TYPE.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete existing requirement types',
          es: 'Permiso para eliminar tipos de requerimientos existentes',
        },
        scope: 'global',
      },
      ACTIVATE: {
        action: PermissionActions.REQUIREMENT_TYPE.ACTIVATE,
        name: { en: 'Activate', es: 'Activar' },
        description: {
          en: 'Permission to activate or deactivate requirement types',
          es: 'Permiso para activar o desactivar tipos de requerimientos',
        },
        scope: 'global',
      },
    },
  },
  REQUIREMENT: {
    name: {
      en: ModuleName.REQUIREMENT,
      es: 'Requerimientos',
    },
    description: {
      en: 'Module to manage system requirements, including their creation, assignment, and closure',
      es: 'Módulo para gestionar los requerimientos del sistema, incluyendo su creación, asignación y cierre',
    },
    features: {
      CREATE: {
        action: PermissionActions.REQUIREMENT.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new requirements in the system',
          es: 'Permiso para crear nuevos requerimientos en el sistema',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.REQUIREMENT.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view existing requirements',
          es: 'Permiso para consultar los requerimientos existentes',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.REQUIREMENT.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing requirements',
          es: 'Permiso para modificar los requerimientos existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.REQUIREMENT.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete existing requirements',
          es: 'Permiso para eliminar requerimientos existentes',
        },
        scope: 'global',
      },
    },
  },
  REQUEST_TYPE: {
    name: {
      en: ModuleName.REQUEST_TYPE,
      es: 'Tipos de Solicitud',
    },
    description: {
      en: 'Module to manage the different types of requests that can be created in the system',
      es: 'Módulo para gestionar los diferentes tipos de solicitudes que pueden ser creadas en el sistema',
    },
    features: {
      CREATE: {
        action: PermissionActions.REQUEST_TYPE.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new request types',
          es: 'Permiso para crear nuevos tipos de solicitud',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.REQUEST_TYPE.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view existing request types',
          es: 'Permiso para consultar los tipos de solicitud existentes',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.REQUEST_TYPE.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing request types',
          es: 'Permiso para modificar los tipos de solicitud existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.REQUEST_TYPE.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete existing request types',
          es: 'Permiso para eliminar tipos de solicitud existentes',
        },
        scope: 'global',
      },
      ACTIVATE: {
        action: PermissionActions.REQUEST_TYPE.ACTIVATE,
        name: { en: 'Activate', es: 'Activar' },
        description: {
          en: 'Permission to activate or deactivate request types',
          es: 'Permiso para activar o desactivar tipos de solicitud',
        },
        scope: 'global',
      },
    },
  },
  AREA: {
    name: {
      en: ModuleName.AREA,
      es: 'Áreas',
    },
    description: {
      en: 'Module to manage the different areas within the system',
      es: 'Módulo para gestionar las diferentes áreas dentro del sistema',
    },
    features: {
      CREATE: {
        action: PermissionActions.AREA.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new areas in the system',
          es: 'Permiso para crear nuevas áreas en el sistema',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.AREA.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view existing areas',
          es: 'Permiso para consultar las áreas existentes',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.AREA.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing areas',
          es: 'Permiso para modificar las áreas existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.AREA.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete existing areas from the system',
          es: 'Permiso para eliminar áreas existentes del sistema',
        },
        scope: 'global',
      },
    },
  },
  USER_MANAGEMENT: {
    name: {
      en: ModuleName.USER_MANAGEMENT,
      es: 'Gestión de Usuarios',
    },
    description: {
      en: 'Module to manage users and their role assignments',
      es: 'Módulo para gestionar usuarios y sus asignaciones de roles',
    },
    features: {
      CREATE: {
        action: PermissionActions.USER_MANAGEMENT.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new users in the system',
          es: 'Permiso para crear nuevos usuarios en el sistema',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.USER_MANAGEMENT.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view existing users',
          es: 'Permiso para consultar usuarios existentes',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.USER_MANAGEMENT.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing users information',
          es: 'Permiso para modificar la información de usuarios existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.USER_MANAGEMENT.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete users from the system',
          es: 'Permiso para eliminar usuarios del sistema',
        },
        scope: 'global',
      },
    },
  },
  ROLE_MANAGEMENT: {
    name: {
      en: ModuleName.ROLE_MANAGEMENT,
      es: 'Gestión de Roles',
    },
    description: {
      en: 'Module to manage roles and role assignments',
      es: 'Módulo para gestionar roles y asignaciones de roles',
    },
    features: {
      CREATE: {
        action: PermissionActions.ROLE_MANAGEMENT.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new roles in the system',
          es: 'Permiso para crear nuevos roles en el sistema',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.ROLE_MANAGEMENT.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view existing roles',
          es: 'Permiso para consultar roles existentes',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.ROLE_MANAGEMENT.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing roles',
          es: 'Permiso para modificar roles existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.ROLE_MANAGEMENT.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete roles from the system',
          es: 'Permiso para eliminar roles del sistema',
        },
        scope: 'global',
      },
      ASSIGN: {
        action: PermissionActions.ROLE_MANAGEMENT.ASSIGN,
        name: { en: 'Assign', es: 'Asignar' },
        description: {
          en: 'Permission to assign roles to users',
          es: 'Permiso para asignar roles a usuarios',
        },
        scope: 'global',
      },
    },
  },
  REPORTS: {
    name: {
      en: ModuleName.REPORTS,
      es: 'Reportes',
    },
    description: {
      en: 'Module to generate and export reports on system data',
      es: 'Módulo para generar y exportar reportes sobre los datos del sistema',
    },
    features: {
      VIEW: {
        action: PermissionActions.REPORTS.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view reports and analytics',
          es: 'Permiso para consultar reportes y análisis',
        },
        scope: 'global',
      },
      EXPORT: {
        action: PermissionActions.REPORTS.EXPORT,
        name: { en: 'Export', es: 'Exportar' },
        description: {
          en: 'Permission to export reports in different formats',
          es: 'Permiso para exportar reportes en diferentes formatos',
        },
        scope: 'global',
      },
    },
  },
  DOCUMENT_MANAGEMENT: {
    name: {
      en: ModuleName.DOCUMENT_MANAGEMENT,
      es: 'Gestión de Documentos',
    },
    description: {
      en: 'Module to manage documents, data rooms, links, and agreements',
      es: 'Módulo para gestionar documentos, salas de datos, enlaces y acuerdos',
    },
    features: {
      CREATE: {
        action: PermissionActions.DOCUMENT_MANAGEMENT.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new documents, data rooms, links, or agreements',
          es: 'Permiso para crear nuevos documentos, salas de datos, enlaces o acuerdos',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.DOCUMENT_MANAGEMENT.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view documents, data rooms, links, and agreements',
          es: 'Permiso para consultar documentos, salas de datos, enlaces y acuerdos',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.DOCUMENT_MANAGEMENT.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing documents, data rooms, links, or agreements',
          es: 'Permiso para modificar documentos, salas de datos, enlaces o acuerdos existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.DOCUMENT_MANAGEMENT.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete documents, data rooms, links, or agreements',
          es: 'Permiso para eliminar documentos, salas de datos, enlaces o acuerdos',
        },
        scope: 'global',
      },
    },
  },
  PRIORITY: {
    name: {
      en: ModuleName.PRIORITY,
      es: 'Prioridades',
    },
    description: {
      en: 'Module to manage priority levels for requests',
      es: 'Módulo para gestionar los niveles de prioridad de las solicitudes',
    },
    features: {
      CREATE: {
        action: PermissionActions.PRIORITY.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new priority levels',
          es: 'Permiso para crear nuevos niveles de prioridad',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.PRIORITY.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view existing priority levels',
          es: 'Permiso para consultar los niveles de prioridad existentes',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.PRIORITY.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing priority levels',
          es: 'Permiso para modificar los niveles de prioridad existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.PRIORITY.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete priority levels from the system',
          es: 'Permiso para eliminar niveles de prioridad del sistema',
        },
        scope: 'global',
      },
    },
  },
  WORKFLOW: {
    name: {
      en: ModuleName.WORKFLOW,
      es: 'Flujos de Trabajo',
    },
    description: {
      en: 'Module to manage workflows and their transitions',
      es: 'Módulo para gestionar flujos de trabajo y sus transiciones',
    },
    features: {
      CREATE: {
        action: PermissionActions.WORKFLOW.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new workflows',
          es: 'Permiso para crear nuevos flujos de trabajo',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.WORKFLOW.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view existing workflows',
          es: 'Permiso para consultar los flujos de trabajo existentes',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.WORKFLOW.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing workflows',
          es: 'Permiso para modificar los flujos de trabajo existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.WORKFLOW.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete workflows from the system',
          es: 'Permiso para eliminar flujos de trabajo del sistema',
        },
        scope: 'global',
      },
    },
  },
  IDENTIFICATION_TYPE: {
    name: {
      en: ModuleName.IDENTIFICATION_TYPE,
      es: 'Tipos de Identificación',
    },
    description: {
      en: 'Module to manage identification types for users',
      es: 'Módulo para gestionar los tipos de identificación de usuarios',
    },
    features: {
      CREATE: {
        action: PermissionActions.IDENTIFICATION_TYPE.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new identification types',
          es: 'Permiso para crear nuevos tipos de identificación',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.IDENTIFICATION_TYPE.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view existing identification types',
          es: 'Permiso para consultar los tipos de identificación existentes',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.IDENTIFICATION_TYPE.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing identification types',
          es: 'Permiso para modificar los tipos de identificación existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.IDENTIFICATION_TYPE.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete identification types from the system',
          es: 'Permiso para eliminar tipos de identificación del sistema',
        },
        scope: 'global',
      },
    },
  },
  DATA_ROOM: {
    name: {
      en: ModuleName.DATA_ROOM,
      es: 'Salas de Datos',
    },
    description: {
      en: 'Module to manage data rooms for storing and organizing documents',
      es: 'Módulo para gestionar salas de datos para almacenar y organizar documentos',
    },
    features: {
      CREATE: {
        action: PermissionActions.DATA_ROOM.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new data rooms',
          es: 'Permiso para crear nuevas salas de datos',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.DATA_ROOM.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view existing data rooms',
          es: 'Permiso para consultar las salas de datos existentes',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.DATA_ROOM.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing data rooms',
          es: 'Permiso para modificar las salas de datos existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.DATA_ROOM.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete data rooms from the system',
          es: 'Permiso para eliminar salas de datos del sistema',
        },
        scope: 'global',
      },
    },
  },
  SHARED_LINK: {
    name: {
      en: ModuleName.SHARED_LINK,
      es: 'Enlaces Compartidos',
    },
    description: {
      en: 'Module to manage shared links for document access',
      es: 'Módulo para gestionar enlaces compartidos para acceso a documentos',
    },
    features: {
      CREATE: {
        action: PermissionActions.SHARED_LINK.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new shared links',
          es: 'Permiso para crear nuevos enlaces compartidos',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.SHARED_LINK.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view existing shared links',
          es: 'Permiso para consultar los enlaces compartidos existentes',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.SHARED_LINK.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing shared links',
          es: 'Permiso para modificar los enlaces compartidos existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.SHARED_LINK.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete shared links from the system',
          es: 'Permiso para eliminar enlaces compartidos del sistema',
        },
        scope: 'global',
      },
    },
  },
  AGREEMENT: {
    name: {
      en: ModuleName.AGREEMENT,
      es: 'Acuerdos',
    },
    description: {
      en: 'Module to manage agreements and contracts',
      es: 'Módulo para gestionar acuerdos y contratos',
    },
    features: {
      CREATE: {
        action: PermissionActions.AGREEMENT.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new agreements',
          es: 'Permiso para crear nuevos acuerdos',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.AGREEMENT.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view existing agreements',
          es: 'Permiso para consultar los acuerdos existentes',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.AGREEMENT.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing agreements',
          es: 'Permiso para modificar los acuerdos existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.AGREEMENT.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete agreements from the system',
          es: 'Permiso para eliminar acuerdos del sistema',
        },
        scope: 'global',
      },
    },
  },
  ASSIGNMENT_HIERARCHY: {
    name: {
      en: ModuleName.ASSIGNMENT_HIERARCHY,
      es: 'Jerarquía de Asignación',
    },
    description: {
      en: 'Module to manage assignment hierarchies and their categories',
      es: 'Módulo para gestionar las jerarquías de asignación y sus categorías',
    },
    features: {
      CREATE: {
        action: PermissionActions.ASSIGNMENT_HIERARCHY.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new assignment hierarchies',
          es: 'Permiso para crear nuevas jerarquías de asignación',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.ASSIGNMENT_HIERARCHY.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view existing assignment hierarchies',
          es: 'Permiso para consultar las jerarquías de asignación existentes',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.ASSIGNMENT_HIERARCHY.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing assignment hierarchies',
          es: 'Permiso para modificar las jerarquías de asignación existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.ASSIGNMENT_HIERARCHY.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete assignment hierarchies from the system',
          es: 'Permiso para eliminar jerarquías de asignación del sistema',
        },
        scope: 'global',
      },
    },
  },
  REQUEST_HIERARCHY: {
    name: {
      en: ModuleName.REQUEST_HIERARCHY,
      es: 'Jerarquía de Solicitud',
    },
    description: {
      en: 'Module to manage request hierarchies and their categories',
      es: 'Módulo para gestionar las jerarquías de solicitud y sus categorías',
    },
    features: {
      CREATE: {
        action: PermissionActions.REQUEST_HIERARCHY.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new request hierarchies',
          es: 'Permiso para crear nuevas jerarquías de solicitud',
        },
        scope: 'global',
      },
      VIEW: {
        action: PermissionActions.REQUEST_HIERARCHY.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view existing request hierarchies',
          es: 'Permiso para consultar las jerarquías de solicitud existentes',
        },
        scope: 'global',
      },
      EDIT: {
        action: PermissionActions.REQUEST_HIERARCHY.EDIT,
        name: { en: 'Edit', es: 'Editar' },
        description: {
          en: 'Permission to edit existing request hierarchies',
          es: 'Permiso para modificar las jerarquías de solicitud existentes',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.REQUEST_HIERARCHY.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete request hierarchies from the system',
          es: 'Permiso para eliminar jerarquías de solicitud del sistema',
        },
        scope: 'global',
      },
    },
  },
  DASHBOARD: {
    name: {
      en: ModuleName.DASHBOARD,
      es: 'Panel de Control',
    },
    description: {
      en: 'Module to access the dashboard with metrics, statistics, and system overview',
      es: 'Módulo para acceder al panel de control con métricas, estadísticas y resumen del sistema',
    },
    features: {
      VIEW: {
        action: PermissionActions.DASHBOARD.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to view the dashboard with metrics and statistics',
          es: 'Permiso para consultar el panel de control con métricas y estadísticas',
        },
        scope: 'global',
      },
      EXPORT: {
        action: PermissionActions.DASHBOARD.EXPORT,
        name: { en: 'Export', es: 'Exportar' },
        description: {
          en: 'Permission to export dashboard data and reports',
          es: 'Permiso para exportar datos del panel de control y reportes',
        },
        scope: 'global',
      },
    },
  },
  API_KEY: {
    name: {
      en: ModuleName.API_KEY,
      es: 'Claves API',
    },
    description: {
      en: 'Module to create, manage, and audit API keys for programmatic access.',
      es: 'Módulo para crear, administrar y auditar claves API para acceso programático.',
    },
    features: {
      VIEW: {
        action: PermissionActions.API_KEY.VIEW,
        name: { en: 'View', es: 'Ver' },
        description: {
          en: 'Permission to list and view API keys and their details.',
          es: 'Permiso para listar y ver las claves API y sus detalles.',
        },
        scope: 'global',
      },
      CREATE: {
        action: PermissionActions.API_KEY.CREATE,
        name: { en: 'Create', es: 'Crear' },
        description: {
          en: 'Permission to create new API keys.',
          es: 'Permiso para crear nuevas claves API.',
        },
        scope: 'global',
      },
      UPDATE: {
        action: PermissionActions.API_KEY.UPDATE,
        name: { en: 'Update', es: 'Actualizar' },
        description: {
          en: 'Permission to update API key metadata and status.',
          es: 'Permiso para actualizar la metadata y el estado de las claves API.',
        },
        scope: 'global',
      },
      DELETE: {
        action: PermissionActions.API_KEY.DELETE,
        name: { en: 'Delete', es: 'Eliminar' },
        description: {
          en: 'Permission to delete API keys.',
          es: 'Permiso para eliminar claves API.',
        },
        scope: 'global',
      },
      MANAGE_RATE_LIMIT: {
        action: PermissionActions.API_KEY.MANAGE_RATE_LIMIT,
        name: { en: 'Manage Rate Limit', es: 'Gestionar límites' },
        description: {
          en: 'Permission to configure rate limits and usage quotas for API keys.',
          es: 'Permiso para configurar límites y cuotas de uso para las claves API.',
        },
        scope: 'global',
      },
    },
  },
};
