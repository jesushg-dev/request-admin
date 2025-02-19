import { db } from '../../server/db-server';

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });

    return user;
  } catch {
    return null;
  }
};

// Fetch user without features
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

// Fetch user with features
export const getUserByIdWithFeatures = async (id: string) => {
  if (!id) throw new Error('User ID is required.');

  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        isTwoFactorEnabled: true,
        isGlobalAdmin: true,
        userTenants: {
          select: {
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
                    roleFeature: {
                      select: { feature: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    // todo: we can't use this method to fetch user with features and roles since we don't have access to a specific tenant
    // Flatten roles and features
    //const roles = user.userRoles?.map((ur) => ur.role.name) || [];
    //const features = user.userRoles?.flatMap((ur) => ur.role.roleFeature.map((rp) => rp.feature.name)) || [];

    return { ...user, roles: [], features: [] };
  } catch {
    return null;
  }
};
