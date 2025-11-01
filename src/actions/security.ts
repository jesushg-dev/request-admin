'use server';

import { getDb } from '@/server/db-client';
import { currentSession } from '@/server/auth-server';

class UserNotFoundErr extends Error {}

export interface SecurityStats {
  totalUsers: number;
  activeRoles: number;
  failedLoginAttempts: number;
  passwordResets: number;
}

/**
 * Get security statistics for a tenant
 */
export async function getSecurityStats(tenantId: string): Promise<SecurityStats> {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const db = await getDb();
  // Get total active users in tenant
  const totalUsers = await db.userTenant.count({
    where: {
      tenantId,
      isActive: true,
    },
  });

  // Get total active roles in tenant
  const activeRoles = await db.role.count({
    where: {
      tenantId,
    },
  });

  // Get failed login attempts in the last 24 hours
  // Note: This would typically be tracked in a separate audit log table
  // For now, we'll count sessions created in the last 24 hours as a proxy
  // You may want to create a separate audit table for login attempts
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);
  
  // This is a placeholder - you'd typically have a failed login attempts table
  // For now, we'll use expired sessions as a proxy metric
  const failedLoginAttempts = await db.session.count({
    where: {
      expiresAt: {
        lt: new Date(),
      },
      createdAt: {
        gte: yesterday,
      },
      // Only count sessions for users in this tenant
      user: {
        userTenants: {
          some: {
            tenantId,
          },
        },
      },
    },
  });

  // Get password reset requests in the last 7 days
  // Note: This would typically be tracked via Verification table with identifier = 'reset-password'
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const passwordResets = await db.verification.count({
    where: {
      identifier: 'reset-password',
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  });

  return {
    totalUsers,
    activeRoles,
    failedLoginAttempts,
    passwordResets,
  };
}

