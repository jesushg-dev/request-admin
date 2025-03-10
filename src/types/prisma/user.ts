import { PermissionActions } from '@/constants/permissions';
import { Prisma } from '@prisma/client';

import { OptionType } from '@/components/custom-ui/select';

// Default select for Users
export const UserDefaultArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    username: true,
    email: true,
    userTenants: {
      select: {
        id: true,
      },
    },
  },
});

// Type for Users with selected fields
export type UserType = Prisma.UserGetPayload<typeof UserDefaultArgs>;

export const UserTenantWithAreaDefaultArgs = Prisma.validator<Prisma.UserTenantDefaultArgs>()({
  select: {
    id: true,
    userAreas: {
      select: {
        areaId: true,
        role: {
          select: {
            name: true,
            areaRoleFeatures: {
              where: {
                feature: {
                  name: {
                    in: [PermissionActions.REQUEST_MANAGEMENT.ASSIGN_USER, PermissionActions.REQUEST_MANAGEMENT.SCOPED_ASSIGN_USER],
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

// Type for UserAreaWithRoles with selected fields
export type UserAreaWithRoleType = Prisma.UserTenantGetPayload<typeof UserTenantWithAreaDefaultArgs>;

export interface AreaRoleOptionType extends OptionType {
  roleOptions: OptionType[];
}
