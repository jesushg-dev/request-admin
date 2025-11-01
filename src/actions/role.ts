'use server';

import { currentSession } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { RoleFormStepperType } from '@/components/common/role/role-form-stepper';

class UserNotFoundErr extends Error {}

export const getRoleAsFormById = async (ids: string[], tenantId: string): Promise<RoleFormStepperType> => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const db = await getDb();
  const roles = await db.role.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      roleFeature: {
        select: {
          id: true,
          isActive: true,
          feature: {
            select: {
              id: true,
              moduleId: true,
              description: true,
              module: { select: { name: true, description: true } },
              name: true,
            },
          },
        },
      },
      userRole: {
        select: {
          id: true,
          userTenantId: true,
          userTenant: {
            select: {
              person: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              user: {
                select: {
                  username: true,
                },
              },
            },
          },
          isActive: true,
        },
        orderBy: { isActive: 'asc' },
      },
    },
    where: { id: { in: ids }, tenantId },
  });

  const roleForm: RoleFormStepperType = {
    roles: roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description ?? '',
      isActive: role.isActive,
      features: role.roleFeature.map((feature) => ({
        id: feature.id,
        moduleId: feature.feature.moduleId,
        moduleName: feature.feature.module.name,
        moduleDescription: feature.feature.module.description ?? '',
        featureId: feature.feature.id,
        featureName: feature.feature.name,
        featureDescription: feature.feature.description ?? '',
        isActive: feature.isActive,
      })),
    })),
    userRoles: roles.flatMap((role) =>
      role.userRole.map((user) => ({
        id: user.id,
        isActive: user.isActive,
        userId: {
          value: user.userTenantId,
          label:
            user.userTenant.person?.firstName && user.userTenant.person?.lastName
              ? `${user.userTenant.person.firstName} ${user.userTenant.person.lastName} @${user.userTenant.user.username}`
              : user.userTenant.user.username,
        },
        roleId: { value: role.id, label: role.name },
      }))
    ),
  } as RoleFormStepperType;

  return roleForm;
};

export const CreateRole = async (data: RoleFormStepperType, tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const db = await getDb();
  const { roles } = data;

  // Validate required fields
  if (!roles || roles.length === 0) {
    throw new Error('At least one role is required');
  }

  // Check if role names already exist for this tenant
  for (const role of roles) {
    if (!role.name) {
      throw new Error('Role name is required');
    }

    const existingRole = await db.role.findFirst({
      where: { name: role.name, tenantId },
    });

    if (existingRole) {
      throw new Error(`A role with the name "${role.name}" already exists`);
    }
  }

  const createdRoles = [];

  for (const role of roles) {
    const createdRole = await db.role.create({
      data: {
        name: role.name,
        description: role.description || '',
        isActive: role.isActive ?? true,
        tenantId,
        createdBy: session.user.id,
        roleFeature: {
          create: role.features.map((feature) => ({
            tenantId,
            isActive: feature.isActive,
            featureId: feature.featureId,
            createdBy: session.user.id,
          })),
        },
      },
      include: {
        roleFeature: {
          include: {
            feature: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    });

    createdRoles.push(createdRole);
  }

  // Handle user role assignments if provided
  if (data.userRoles && data.userRoles.length > 0) {
    for (const userRole of data.userRoles) {
      const role = createdRoles.find((r) => r.id === userRole.roleId.value);
      if (role) {
        await db.userTenantRole.create({
          data: {
            tenantId,
            isActive: userRole.isActive,
            userTenantId: userRole.userId.value,
            roleId: role.id,
            createdBy: session.user.id,
          },
        });
      }
    }
  }

  return createdRoles;
};

export const UpdateRole = async (data: RoleFormStepperType, tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const db = await getDb();
  const { roles } = data;

  // Validate required fields
  if (!roles || roles.length === 0) {
    throw new Error('At least one role is required');
  }

  const updatedRoles = [];

  for (const role of roles) {
    if (!role.name) {
      throw new Error('Role name is required');
    }

    // Check if role exists and belongs to tenant
    const existingRole = await db.role.findFirst({
      where: { id: role.id, tenantId },
    });

    if (!existingRole) {
      throw new Error(`Role with ID "${role.id}" not found`);
    }

    // Check if name already exists for another role in this tenant
    const duplicateName = await db.role.findFirst({
      where: {
        name: role.name,
        tenantId,
        id: { not: role.id },
      },
    });

    if (duplicateName) {
      throw new Error(`A role with the name "${role.name}" already exists`);
    }

    // Update role with related data
    const updatedRole = await db.role.update({
      where: { id: role.id, tenantId },
      data: {
        name: role.name,
        description: role.description || '',
        isActive: role.isActive ?? true,
        updatedBy: session.user.id,
        roleFeature: {
          deleteMany: { tenantId, roleId: role.id },
          create: role.features.map((feature) => ({
            tenantId,
            isActive: feature.isActive,
            featureId: feature.featureId,
            createdBy: session.user.id,
          })),
        },
      },
      include: {
        roleFeature: {
          include: {
            feature: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    });

    updatedRoles.push(updatedRole);
  }

  // Handle user role assignments
  if (data.userRoles && data.userRoles.length > 0) {
    // Delete existing user roles for these roles
    const roleIds = roles.map((r) => r.id);
    await db.userTenantRole.deleteMany({
      where: {
        tenantId,
        roleId: { in: roleIds },
      },
    });

    // Create new user role assignments
    for (const userRole of data.userRoles) {
      const role = updatedRoles.find((r) => r.id === userRole.roleId.value);
      if (role) {
        await db.userTenantRole.create({
          data: {
            tenantId,
            isActive: userRole.isActive,
            userTenantId: userRole.userId.value,
            roleId: role.id,
            createdBy: session.user.id,
          },
        });
      }
    }
  }

  return updatedRoles;
};
