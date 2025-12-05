import { db } from '@/server/db-client';

/**
 * Gets all tenants for a given user by querying the database directly.
 * This avoids HTTP calls that could cause infinite loops in proxy.
 * Uses the base Prisma client directly since we don't need ZenStack policies for this simple query.
 */
export async function getTenantsForUser(userId: string): Promise<{ id: string }[]> {
  try {
    const tenants = await db.tenant.findMany({
      select: { id: true },
      where: { userTenants: { some: { userId } } },
    });
    return tenants;
  } catch (error) {
    console.error('Failed to get tenants for user:', error);
    throw new Error('Failed to get tenants for user');
  }
}

/**
 * Validates if a tenant exists and the user has access to it.
 * This avoids HTTP calls that could cause infinite loops in proxy.
 * Uses the base Prisma client directly since we don't need ZenStack policies for this simple query.
 *
 * @param tenantId - The tenant ID to validate
 * @param userId - The user ID to check access for
 * @returns true if the tenant exists and the user has access, false otherwise
 */
export async function validateTenantId(tenantId: string | undefined, userId: string): Promise<boolean> {
  if (!tenantId) return false;

  try {
    // Check if the tenant exists and the user has access to it
    const userTenant = await db.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId,
          tenantId,
        },
      },
    });
    return !!userTenant;
  } catch (error) {
    console.error('Failed to validate tenant ID:', error);
    return false;
  }
}
