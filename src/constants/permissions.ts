export enum ModuleName {
  REQUEST_MANAGEMENT = 'Request Management',
  FORM_DESIGNER = 'Form Designer',
  REQUIREMENT_TYPE = 'Requirement Type',
  REQUIREMENT = 'Requirement',
  REQUEST_TYPE = 'Request Type',
  AREA = 'Area',
  USER_MANAGEMENT = 'User Management',
  ROLE_MANAGEMENT = 'Role Management',
}

export const PermissionActions = {
  REQUEST_MANAGEMENT: {
    CREATE: 'request_create',
    VIEW: 'request_view',
    EDIT: 'request_edit',
    DISABLE: 'request_disable',
    ASSIGN_USER: 'request_assign_user',
    SET_PRIORITY: 'request_set_priority',
    SEND_DOCUMENTS: 'request_send_documents',
  },
  FORM_DESIGNER: {
    CREATE: 'form_create',
    VIEW: 'form_view',
    EDIT: 'form_edit',
    DELETE: 'form_delete',
    PUBLISH: 'form_publish',
  },
  REQUIREMENT_TYPE: {
    CREATE: 'requirement_type_create',
    VIEW: 'requirement_type_view',
    EDIT: 'requirement_type_edit',
    DELETE: 'requirement_type_delete',
    ACTIVATE: 'requirement_type_activate',
  },
  REQUIREMENT: {
    CREATE: 'requirement_create',
    VIEW: 'requirement_view',
    EDIT: 'requirement_edit',
    DELETE: 'requirement_delete',
  },
  REQUEST_TYPE: {
    CREATE: 'request_type_create',
    VIEW: 'request_type_view',
    EDIT: 'request_type_edit',
    DELETE: 'request_type_delete',
    ACTIVATE: 'request_type_activate',
  },
  AREA: {
    CREATE: 'area_create',
    VIEW: 'area_view',
    EDIT: 'area_edit',
    DELETE: 'area_delete',
  },
  USER_MANAGEMENT: {
    CREATE: 'user_create',
    VIEW: 'user_view',
    EDIT: 'user_edit',
    DELETE: 'user_delete',
  },
  ROLE_MANAGEMENT: {
    CREATE: 'role_create',
    ASSIGN: 'role_assign',
  },
} satisfies PermissionActionsDefinition;

type PermissionActionsDefinition = {
  [key in keyof typeof ModuleName]: {
    [action: string]: string;
  };
};

export type PermissionAction = (typeof PermissionActions)[keyof typeof PermissionActions][keyof (typeof PermissionActions)[keyof typeof PermissionActions]];
