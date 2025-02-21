'use server';

import { db } from '@/server/db-client';

import { AreaRoleOptionType } from '@/types/prisma/user';
import { AreaFormStepperType } from '@/components/common/area/area-form-stepper';

import { getAssignmentCategoriesByIds } from './assignment-type';

export async function getAreaByTenandIdAndAreaId(tenantId: string, areaId: string): Promise<AreaFormStepperType> {
  const area = await db.area.findFirstOrThrow({
    where: {
      tenantId,
      id: areaId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      areaRole: {
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          areaRoleFeatures: {
            select: {
              id: true,
              isActive: true,
              featureId: true,
              feature: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  isActive: true,
                  module: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                      isActive: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      userAreas: {
        select: {
          id: true,
          isActive: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          userTenant: {
            select: {
              id: true,
              person: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              user: {
                select: {
                  username: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      assignmentCategories: {
        select: {
          id: true,
        },
        where: {
          isActive: true,
          hierarchyLevel: {
            position: 1,
          },
        },
      },
    },
  });

  const categoryIds = area.assignmentCategories.map((category) => category.id);
  console.log('🚀 ~ getAreaByTenandIdAndAreaId ~ categoryIds:', categoryIds);
  const { categories } = await getAssignmentCategoriesByIds(categoryIds, tenantId);

  return {
    id: area.id,
    name: area.name,
    description: area.description ?? '',
    isActive: area.isActive,
    roles: area.areaRole.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description ?? '',
      isActive: role.isActive,
      features: role.areaRoleFeatures.map((feature) => ({
        id: feature.id,
        isActive: feature.isActive,
        featureId: feature.featureId,
        moduleId: feature.feature.module.id,
        moduleName: feature.feature.module.name,
        moduleDescription: feature.feature.module.description ?? '',
        featureName: feature.feature.name,
        featureDescription: feature.feature.description ?? '',
      })),
    })),
    userRoles: area.userAreas.map((userArea) => ({
      id: userArea.id,
      isActive: userArea.isActive,
      userId: {
        value: userArea.userTenant.id,
        label: userArea.userTenant.person ? `${userArea.userTenant.person.firstName} ${userArea.userTenant.person.lastName} @${userArea.userTenant.user.username}` : userArea.userTenant.user.username,
      },
      roleId: {
        value: userArea.role.id,
        label: userArea.role.name,
      },
    })),
    categories,
  };

  /*
   userRoles: z.array(
      z.object({
        id: z.string().uuid().default(generateUuid),
        userId: z.object({
          value: z.string().min(1, 'User is required'),
          label: z.string().min(1),
        }),
        roleId: z.object({
          value: z.string().min(1, 'Role is required'),
          label: z.string().min(1),
        }),
        isActive: z.boolean().default(true),
      })
    ),
  */
}

export async function getAreasWithRolesAsOptionsByTenantId(tenantId: string): Promise<AreaRoleOptionType[]> {
  const areas = await db.area.findMany({
    where: {
      tenantId,
    },
    select: {
      id: true,
      name: true,
      isActive: true,
      areaRole: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
    },
  });

  //only return active areas with active roles
  return areas
    .filter((area) => area.isActive /*&& area.areaRole.some((role) => role.isActive)*/)
    .map((area) => ({
      label: `${area.name} (${area.areaRole.filter((role) => role.isActive).length} roles)`,
      value: area.id,
      roleOptions: area.areaRole
        .filter((role) => role.isActive)
        .map((role) => ({
          label: role.name,
          value: role.id,
        })),
    }));
}
