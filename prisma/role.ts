import { PermissionActions } from '@/constants/permissions';
import { PrismaClient } from '@prisma/client';

export interface TestUserData {
  name: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  roleName: string; // System role name that this user should have
}

// List of test users with diverse information and their assigned roles
export const TEST_USERS: TestUserData[] = [
  { name: 'María González', email: 'maria.gonzalez@claro.com.ni', username: 'maria.gonzalez', firstName: 'María', lastName: 'González', phone: '88881234', roleName: 'Coordinador' },
  { name: 'Carlos Ramírez', email: 'carlos.ramirez@claro.com.ni', username: 'carlos.ramirez', firstName: 'Carlos', lastName: 'Ramírez', phone: '88881235', roleName: 'Analista' },
  { name: 'Ana Martínez', email: 'ana.martinez@claro.com.ni', username: 'ana.martinez', firstName: 'Ana', lastName: 'Martínez', phone: '88881236', roleName: 'Distribuidor' },
  { name: 'Luis Fernández', email: 'luis.fernandez@claro.com.ni', username: 'luis.fernandez', firstName: 'Luis', lastName: 'Fernández', phone: '88881237', roleName: 'Coordinador' },
  { name: 'Laura Sánchez', email: 'laura.sanchez@claro.com.ni', username: 'laura.sanchez', firstName: 'Laura', lastName: 'Sánchez', phone: '88881238', roleName: 'Analista' },
  { name: 'Roberto Jiménez', email: 'roberto.jimenez@claro.com.ni', username: 'roberto.jimenez', firstName: 'Roberto', lastName: 'Jiménez', phone: '88881239', roleName: 'Distribuidor' },
  { name: 'Carmen Díaz', email: 'carmen.diaz@claro.com.ni', username: 'carmen.diaz', firstName: 'Carmen', lastName: 'Díaz', phone: '88881240', roleName: 'Coordinador' },
  { name: 'Diego Morales', email: 'diego.morales@claro.com.ni', username: 'diego.morales', firstName: 'Diego', lastName: 'Morales', phone: '88881241', roleName: 'Analista' },
  { name: 'Patricia Vega', email: 'patricia.vega@claro.com.ni', username: 'patricia.vega', firstName: 'Patricia', lastName: 'Vega', phone: '88881242', roleName: 'Distribuidor' },
  { name: 'Fernando Castro', email: 'fernando.castro@claro.com.ni', username: 'fernando.castro', firstName: 'Fernando', lastName: 'Castro', phone: '88881243', roleName: 'Analista' },
];

// Define common permissions for reuse
export const SUPERVISOR_FEATURES = [
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_ASSIGN_USER,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_CREATE,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_DISABLE,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_EDIT,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_SEND_DOCUMENTS,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_PRIORITY,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_STATUS,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_VIEW,
];

export const COLABORADOR_FEATURES = [
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_CREATE,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_SEND_DOCUMENTS,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_STATUS,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_VIEW,
];

// System role features definitions
const ADMINISTRADOR_FEATURES = [
  // Dashboard
  PermissionActions.DASHBOARD.VIEW,
  PermissionActions.DASHBOARD.EXPORT,
  // Request Management 
  PermissionActions.REQUEST_MANAGEMENT.CREATE,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_CREATE,
  PermissionActions.REQUEST_MANAGEMENT.VIEW,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_VIEW,
  PermissionActions.REQUEST_MANAGEMENT.EDIT,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_EDIT,
  PermissionActions.REQUEST_MANAGEMENT.DISABLE,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_DISABLE,
  PermissionActions.REQUEST_MANAGEMENT.ASSIGN_USER,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_ASSIGN_USER,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_STATUS,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_PRIORITY,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_SEND_DOCUMENTS,
  // User Management
  PermissionActions.USER_MANAGEMENT.CREATE,
  PermissionActions.USER_MANAGEMENT.VIEW,
  PermissionActions.USER_MANAGEMENT.EDIT,
  PermissionActions.USER_MANAGEMENT.DELETE,
  // Role Management
  PermissionActions.ROLE_MANAGEMENT.CREATE,
  PermissionActions.ROLE_MANAGEMENT.VIEW,
  PermissionActions.ROLE_MANAGEMENT.EDIT,
  PermissionActions.ROLE_MANAGEMENT.DELETE,
  PermissionActions.ROLE_MANAGEMENT.ASSIGN,
  // Reports
  PermissionActions.REPORTS.VIEW,
  PermissionActions.REPORTS.EXPORT,
  // Configuration Modules
  PermissionActions.AREA.CREATE,
  PermissionActions.AREA.VIEW,
  PermissionActions.AREA.EDIT,
  PermissionActions.AREA.DELETE,
  PermissionActions.REQUEST_TYPE.CREATE,
  PermissionActions.REQUEST_TYPE.VIEW,
  PermissionActions.REQUEST_TYPE.EDIT,
  PermissionActions.REQUEST_TYPE.DELETE,
  PermissionActions.REQUEST_TYPE.ACTIVATE,
  PermissionActions.REQUIREMENT_TYPE.CREATE,
  PermissionActions.REQUIREMENT_TYPE.VIEW,
  PermissionActions.REQUIREMENT_TYPE.EDIT,
  PermissionActions.REQUIREMENT_TYPE.DELETE,
  PermissionActions.REQUIREMENT_TYPE.ACTIVATE,
  PermissionActions.REQUIREMENT.CREATE,
  PermissionActions.REQUIREMENT.VIEW,
  PermissionActions.REQUIREMENT.EDIT,
  PermissionActions.REQUIREMENT.DELETE,
  PermissionActions.PRIORITY.CREATE,
  PermissionActions.PRIORITY.VIEW,
  PermissionActions.PRIORITY.EDIT,
  PermissionActions.PRIORITY.DELETE,
  PermissionActions.WORKFLOW.CREATE,
  PermissionActions.WORKFLOW.VIEW,
  PermissionActions.WORKFLOW.EDIT,
  PermissionActions.WORKFLOW.DELETE,
  PermissionActions.ASSIGNMENT_HIERARCHY.CREATE,
  PermissionActions.ASSIGNMENT_HIERARCHY.VIEW,
  PermissionActions.ASSIGNMENT_HIERARCHY.EDIT,
  PermissionActions.ASSIGNMENT_HIERARCHY.DELETE,
  PermissionActions.REQUEST_HIERARCHY.CREATE,
  PermissionActions.REQUEST_HIERARCHY.VIEW,
  PermissionActions.REQUEST_HIERARCHY.EDIT,
  PermissionActions.REQUEST_HIERARCHY.DELETE,
  PermissionActions.IDENTIFICATION_TYPE.CREATE,
  PermissionActions.IDENTIFICATION_TYPE.VIEW,
  PermissionActions.IDENTIFICATION_TYPE.EDIT,
  PermissionActions.IDENTIFICATION_TYPE.DELETE,
  // Document Management
  PermissionActions.DOCUMENT_MANAGEMENT.CREATE,
  PermissionActions.DOCUMENT_MANAGEMENT.VIEW,
  PermissionActions.DOCUMENT_MANAGEMENT.EDIT,
  PermissionActions.DOCUMENT_MANAGEMENT.DELETE,
  PermissionActions.DATA_ROOM.CREATE,
  PermissionActions.DATA_ROOM.VIEW,
  PermissionActions.DATA_ROOM.EDIT,
  PermissionActions.DATA_ROOM.DELETE,
  PermissionActions.SHARED_LINK.CREATE,
  PermissionActions.SHARED_LINK.VIEW,
  PermissionActions.SHARED_LINK.EDIT,
  PermissionActions.SHARED_LINK.DELETE,
  PermissionActions.AGREEMENT.CREATE,
  PermissionActions.AGREEMENT.VIEW,
  PermissionActions.AGREEMENT.EDIT,
  PermissionActions.AGREEMENT.DELETE,
  // Form Designer
  PermissionActions.FORM_DESIGNER.CREATE,
  PermissionActions.FORM_DESIGNER.VIEW,
  PermissionActions.FORM_DESIGNER.EDIT,
  PermissionActions.FORM_DESIGNER.DELETE,
  PermissionActions.FORM_DESIGNER.PUBLISH,
];

const COORDINADOR_FEATURES = [
  // Dashboard
  PermissionActions.DASHBOARD.VIEW,
  PermissionActions.DASHBOARD.EXPORT,
  // Request Management - Supervision and assignment
  PermissionActions.REQUEST_MANAGEMENT.VIEW,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_VIEW,
  PermissionActions.REQUEST_MANAGEMENT.EDIT,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_EDIT,
  PermissionActions.REQUEST_MANAGEMENT.ASSIGN_USER,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_ASSIGN_USER,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_STATUS,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_PRIORITY,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_SEND_DOCUMENTS,
  // Reports
  PermissionActions.REPORTS.VIEW,
  PermissionActions.REPORTS.EXPORT,
  // Document Management - View only
  PermissionActions.DOCUMENT_MANAGEMENT.VIEW,
  PermissionActions.DATA_ROOM.VIEW,
  PermissionActions.SHARED_LINK.VIEW,
  PermissionActions.AGREEMENT.VIEW,
];

const ANALISTA_FEATURES = [
  // Dashboard
  PermissionActions.DASHBOARD.VIEW,
  // Request Management - Request resolution
  PermissionActions.REQUEST_MANAGEMENT.VIEW,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_VIEW,
  PermissionActions.REQUEST_MANAGEMENT.EDIT,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_EDIT,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_STATUS,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_SEND_DOCUMENTS,
  // Document Management - View and send
  PermissionActions.DOCUMENT_MANAGEMENT.VIEW,
  PermissionActions.DATA_ROOM.VIEW,
  PermissionActions.SHARED_LINK.VIEW,
];

const DISTRIBUIDOR_FEATURES = [
  // Request Management - Only create requests
  PermissionActions.REQUEST_MANAGEMENT.CREATE,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_CREATE,
  PermissionActions.REQUEST_MANAGEMENT.VIEW,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_VIEW,
  PermissionActions.REQUEST_MANAGEMENT.SCOPED_SEND_DOCUMENTS,
  // Document Management - Basic view
  PermissionActions.DOCUMENT_MANAGEMENT.VIEW,
];

// System roles configuration
export interface SystemRoleData {
  name: string;
  description: string;
  features: string[];
  userTenantId: string[];
}

export const SYSTEM_ROLES: SystemRoleData[] = [
  {
    name: 'Administrador',
    description: 'El Administrador es responsable de garantizar la seguridad y el acceso al sistema. Gestiona usuarios, configura el sistema y controla permisos y restricciones para proteger la información. También supervisa tareas como el restablecimiento de contraseñas y la asignación de roles.',
    features: ADMINISTRADOR_FEATURES,
    userTenantId: [], // Will be assigned via USER_TENANT_JESUS_ID parameter
  },
  {
    name: 'Coordinador',
    description: 'El Coordinador es el encargado de supervisar y gestionar las solicitudes de servicios de telecomunicaciones. Actúa como intermediario entre los usuarios y los analistas, asegurando que las solicitudes se asignen y resuelvan de manera oportuna.',
    features: COORDINADOR_FEATURES,
    userTenantId: [],
  },
  {
    name: 'Analista',
    description: 'El Analista es el responsable de resolver las solicitudes asignadas por el Coordinador. Debe brindar soluciones efectivas y oportunas, siguiendo los procedimientos establecidos por la empresa.',
    features: ANALISTA_FEATURES,
    userTenantId: [], // Will be assigned via USER_TENANT_DANILO_ID parameter
  },
  {
    name: 'Distribuidor',
    description: 'Usuario externo autorizado que representa comercialmente a Claro-Nicaragua. Su función principal es registrar solicitudes en nombre de los clientes, ya sea para activaciones, suspensiones, renovaciones u otros servicios relacionados con telecomunicaciones. Además, puede solicitar apoyo en otros temas vinculados a los servicios provistos por la empresa.',
    features: DISTRIBUIDOR_FEATURES,
    userTenantId: [],
  },
];

/**
 * Creates system roles in the database
 * @param prisma Prisma client instance
 * @param tenantId Tenant ID
 * @param jesusUserTenantId User tenant ID for Jesus (Administrador role)
 * @param daniloUserTenantId User tenant ID for Danilo (Analista role)
 */
export async function createSystemRoles(
  prisma: PrismaClient,
  tenantId: string,
  jesusUserTenantId: string,
  daniloUserTenantId: string
) {
  // Assign user tenant IDs to specific roles
  const systemRoles = SYSTEM_ROLES.map((role) => {
    if (role.name === 'Administrador') {
      return { ...role, userTenantId: [jesusUserTenantId] };
    }
    if (role.name === 'Analista') {
      return { ...role, userTenantId: [daniloUserTenantId] };
    }
    return role;
  });

  for (const roleData of systemRoles) {
    const role = await prisma.role.create({
      data: {
        name: roleData.name,
        description: roleData.description,
        tenantId: tenantId,
        createdBy: 'system',
        roleFeature: {
          create: roleData.features.map((featureKey) => ({
            tenant: { connect: { id: tenantId } },
            feature: { connect: { key: featureKey } },
            createdBy: 'system',
          })),
        },
      },
    });

    // Assign roles to users if specified
    for (const userTenantId of roleData.userTenantId) {
      await prisma.userTenantRole.create({
        data: {
          tenantId: tenantId,
          userTenantId: userTenantId,
          roleId: role.id,
          isActive: true,
          createdBy: 'system',
        },
      });
    }
  }
}
