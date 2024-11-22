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
      include: {
        userRole: {
          include: {
            role: {
              include: {
                rolePermission: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    // Flatten roles and permissions
    const roles = user.userRole?.map((ur) => ur.role.name) || [];
    const permissions = user.userRole?.flatMap((ur) => ur.role.rolePermission.map((rp) => rp.permission.name)) || [];

    return { ...user, roles, permissions };
  } catch (error) {
    return null;
  }
};
