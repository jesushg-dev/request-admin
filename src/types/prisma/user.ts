import { Prisma } from '@prisma/client';

import { OptionType } from '@/components/select/select';

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

export interface AreaRoleOptionType extends OptionType {
  roleOptions: OptionType[];
}

// Type for Users with selected fields
export type UserType = Prisma.UserGetPayload<typeof UserDefaultArgs>;
