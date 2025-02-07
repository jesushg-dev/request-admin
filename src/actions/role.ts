import { auth } from '@/server/auth';
import { db } from '@/server/db-client';

import { ModuleDefaultArgs } from '@/types/prisma/module';
import { RoleFormStepperType } from '@/components/common/role/role-form-stepper';

class UserNotFoundErr extends Error {}

export const getModulesWithFeatures = async (tenantId: string) => {
  const session = await auth();
  if (!session) {
    throw new UserNotFoundErr('User not found');
  }

  const modules = await db.module.findMany({
    ...ModuleDefaultArgs,
    where: { isActive: true, tenantId, feature: { every: { scope: 'global', isActive: true } } },
  });
  return modules;
};

export const getRoleAsFormById = async (id: string, tenantId: string): Promise<RoleFormStepperType> => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr('User not found');

  const role = await db.role.findFirstOrThrow({
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
    where: { id, tenantId },
  });

  const initialValues: RoleFormStepperType = {
    roles: [
      {
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
      },
    ],
    userRoles: role.userRole.map((user) => ({
      id: user.id,
      isActive: user.isActive,
      userId: {
        value: user.userTenantId,
        label:
          user.userTenant.person?.firstName && user.userTenant.person?.lastName
            ? `${user.userTenant.person?.firstName} ${user.userTenant.person?.lastName} @${user.userTenant.user.username}`
            : user.userTenant.user.username,
      },
      roleId: { value: role.id, label: role.name },
    })),
  };

  return initialValues;
};
