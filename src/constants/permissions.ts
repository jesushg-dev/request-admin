export enum ModuleName {
  REQUEST_MANAGEMENT = 'Request Management',
  FORM_DESIGNER = 'Form Designer',
  REQUIREMENT_TYPE = 'Requirement Type',
  REQUIREMENT = 'Requirement',
  REQUEST_TYPE = 'Request Type',
  AREA = 'Area',
  USER_MANAGEMENT = 'User Management',
  ROLE_MANAGEMENT = 'Role Management',
  REPORTS = 'Reports',
  DOCUMENT_MANAGEMENT = 'Document Management',
  PRIORITY = 'Priority',
  WORKFLOW = 'Workflow',
  IDENTIFICATION_TYPE = 'Identification Type',
  DATA_ROOM = 'Data Room',
  SHARED_LINK = 'Shared Link',
  AGREEMENT = 'Agreement',
  ASSIGNMENT_HIERARCHY = 'Assignment Hierarchy',
  REQUEST_HIERARCHY = 'Request Hierarchy',
  DASHBOARD = 'Dashboard',
}

export const PermissionActions = {
  REQUEST_MANAGEMENT: {
    CREATE: 'request_create',
    SCOPED_CREATE: 'request_scoped_create',
    VIEW: 'request_view',
    SCOPED_VIEW: 'request_scoped_view',
    EDIT: 'request_edit',
    SCOPED_EDIT: 'request_scoped_edit',
    DISABLE: 'request_disable',
    SCOPED_DISABLE: 'request_scoped_disable',
    ASSIGN_USER: 'request_assign_user',
    SCOPED_ASSIGN_USER: 'request_scoped_assign_user',
    SCOPED_SET_STATUS: 'request_set_status',
    SCOPED_SET_PRIORITY: 'request_set_priority',
    SCOPED_SEND_DOCUMENTS: 'request_send_documents',
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
    VIEW: 'role_view',
    EDIT: 'role_edit',
    DELETE: 'role_delete',
    ASSIGN: 'role_assign',
  },
  REPORTS: {
    VIEW: 'reports_view',
    EXPORT: 'reports_export',
  },
  DOCUMENT_MANAGEMENT: {
    CREATE: 'document_create',
    VIEW: 'document_view',
    EDIT: 'document_edit',
    DELETE: 'document_delete',
  },
  PRIORITY: {
    CREATE: 'priority_create',
    VIEW: 'priority_view',
    EDIT: 'priority_edit',
    DELETE: 'priority_delete',
  },
  WORKFLOW: {
    CREATE: 'workflow_create',
    VIEW: 'workflow_view',
    EDIT: 'workflow_edit',
    DELETE: 'workflow_delete',
  },
  IDENTIFICATION_TYPE: {
    CREATE: 'identification_type_create',
    VIEW: 'identification_type_view',
    EDIT: 'identification_type_edit',
    DELETE: 'identification_type_delete',
  },
  DATA_ROOM: {
    CREATE: 'data_room_create',
    VIEW: 'data_room_view',
    EDIT: 'data_room_edit',
    DELETE: 'data_room_delete',
  },
  SHARED_LINK: {
    CREATE: 'shared_link_create',
    VIEW: 'shared_link_view',
    EDIT: 'shared_link_edit',
    DELETE: 'shared_link_delete',
  },
  AGREEMENT: {
    CREATE: 'agreement_create',
    VIEW: 'agreement_view',
    EDIT: 'agreement_edit',
    DELETE: 'agreement_delete',
  },
  ASSIGNMENT_HIERARCHY: {
    CREATE: 'assignment_hierarchy_create',
    VIEW: 'assignment_hierarchy_view',
    EDIT: 'assignment_hierarchy_edit',
    DELETE: 'assignment_hierarchy_delete',
  },
  REQUEST_HIERARCHY: {
    CREATE: 'request_hierarchy_create',
    VIEW: 'request_hierarchy_view',
    EDIT: 'request_hierarchy_edit',
    DELETE: 'request_hierarchy_delete',
  },
  DASHBOARD: {
    VIEW: 'dashboard_view',
    EXPORT: 'dashboard_export',
  },
} satisfies PermissionActionsDefinition;

type PermissionActionsDefinition = {
  [key in keyof typeof ModuleName]: {
    [action: string]: string;
  };
};

export type PermissionAction = (typeof PermissionActions)[keyof typeof PermissionActions][keyof (typeof PermissionActions)[keyof typeof PermissionActions]];
