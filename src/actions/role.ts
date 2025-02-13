import { auth } from '@/server/auth';
import { db } from '@/server/db-client';

import { RoleFormStepperType } from '@/components/common/role/role-form-stepper';

class UserNotFoundErr extends Error {}

export const getRoleAsFormById = async (ids: string[], tenantId: string): Promise<RoleFormStepperType> => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr('User not found');

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
