import { db } from '../../server/db-server';

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });

    return user;
  } catch {
    return null;
  }
};

// Fetch user without permissions
export const getUserById = async (id: string) => {
  if (!id) throw new Error('User ID is required.');

  try {
    return await db.user.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Fetch user with permissions
export const getUserByIdWithPermissions = async (id: string) => {
  if (!id) throw new Error('User ID is required.');

  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        isTwoFactorEnabled: true,
        person: {
          select: {
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
                rolePermission: {
                  select: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    // Flatten roles and permissions
    const roles = user.userRoles?.map((ur) => ur.role.name) || [];
    const permissions = user.userRoles?.flatMap((ur) => ur.role.rolePermission.map((rp) => rp.permission.name)) || [];

    return { ...user, roles, permissions };
  } catch (error) {
    return null;
  }
};
