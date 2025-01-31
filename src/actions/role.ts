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

export const getRoleAsFormById = async (id: string, tenantId: string) => {
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
      userRole: { select: { id: true, userTenantId: true, isActive: true }, orderBy: { isActive: 'asc' } },
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
    userRoles:
      role.userRole.length === 0
        ? [
            {
              id: '',
              isActive: true,
              userId: { value: '', label: '' },
              roleId: { value: role.id, label: role.name },
            },
          ]
        : [
            {
              id: role.userRole[0].id,
              isActive: role.userRole[0].isActive,
              userId: { value: role.userRole[0].userTenantId, label: role.userRole[0].userTenantId },
              roleId: { value: role.id, label: role.name },
            },
            ...role.userRole.slice(1).map((user) => ({
              id: user.id,
              isActive: user.isActive,
              userId: { value: user.userTenantId, label: user.userTenantId },
              roleId: { value: role.id, label: role.name },
            })),
          ],
  };

  return initialValues;
};
