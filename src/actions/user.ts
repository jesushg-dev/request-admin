import { auth } from '@/server/auth';
import { db } from '@/server/db-client';

class UserNotFoundErr extends Error {}

export const getUsersAsOptions = async (tenantId: string) => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      userTenants: {
        select: {
          id: true,
          person: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        where: { tenantId },
      },
    },
    where: { userTenants: { every: { tenantId } } },
  });

  return users.map((user) => ({
    label:
      user.userTenants[0].person?.firstName && user.userTenants[0].person?.lastName
        ? `${user.userTenants[0].person?.firstName} ${user.userTenants[0].person?.lastName} @${user.username}`
        : user.username,
    value: user.userTenants[0].id,
  }));
};
