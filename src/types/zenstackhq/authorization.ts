import { Prisma } from '@zenstackhq/runtime/models';

export const UserTenantDefaultArgs = Prisma.validator<Prisma.UserTenantDefaultArgs>()({
  select: {
    id: true,
    role: true,
    isActive: true,
    isTermAccepted: true,
    userRoles: {
      select: {
        role: {
          select: {
            roleFeature: {
              select: {
                feature: {
                  select: { key: true },
                },
              },
            },
          },
        },
      },
    },
    userAreas: {
      select: {
        area: {
          select: {
            id: true,
            areaRole: {
              select: {
                areaRoleFeatures: {
                  select: {
                    feature: {
                      select: { key: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export type UserTenantWithRelations = Prisma.UserTenantGetPayload<typeof UserTenantDefaultArgs>;
