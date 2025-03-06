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
};
