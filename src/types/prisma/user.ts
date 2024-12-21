import { Prisma } from '@prisma/client';

// Default select for Users
export const UserDefaultArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: { id: true, username: true, email: true },
});

// Type for Users with selected fields
export type UserType = Prisma.UserGetPayload<typeof UserDefaultArgs>;
