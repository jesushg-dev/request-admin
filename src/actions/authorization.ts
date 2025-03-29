// authorization.ts (Server Utilities)
'use server';

import { PermissionAction } from '@/constants/permissions';
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

import { UserTenantDefaultArgs } from '@/types/prisma/authorization';

export { PermissionActions as PERMISSION } from '@/constants/permissions';

class AuthorizationError extends Error {}

export const checkAuthorization = async (tenantId: string, requiredPermission: PermissionAction): Promise<boolean> => {
  const session = await currentSession();
  if (!session?.user) throw new AuthorizationError('Unauthorized');

  // Admin/Owner bypass
  if (session.user.isGlobalAdmin || ['owner', 'admin'].includes(session.user.role || '')) {
    return true;
  }

  const userTenant = await db.userTenant.findUnique({
    ...UserTenantDefaultArgs,
    where: { userId_tenantId: { userId: session.user.id, tenantId } },
  });

  if (!userTenant) return false;

  // Check role-based permissions
  const rolePermissions = userTenant.userRoles.flatMap((ur) => ur.role.roleFeature.map((rf) => rf.feature.key));

  // Check area-based permissions (all areas)
  const areaPermissions = userTenant.userAreas.flatMap((ua) => ua.area.areaRole.flatMap((ar) => ar.areaRoleFeatures.map((arf) => arf.feature.key)));

  return [...rolePermissions, ...areaPermissions].includes(requiredPermission);
};

export const checkAreaAuthorization = async (tenantId: string, areaId: string, requiredPermission: PermissionAction): Promise<boolean> => {
  const session = await currentSession();
  if (!session?.user) throw new AuthorizationError('Unauthorized');

  // Admin/Owner bypass
  if (session.user.isGlobalAdmin || ['owner', 'admin'].includes(session.user.role || '')) {
    return true;
  }

  const userTenant = await db.userTenant.findUnique({
    ...UserTenantDefaultArgs,
    where: { userId_tenantId: { userId: session.user.id, tenantId } },
  });

  if (!userTenant) return false;

  // Find specific area permissions
  const targetArea = userTenant.userAreas.find((ua) => ua.area.id === areaId);
  if (!targetArea) return false;

  const areaPermissions = targetArea.area.areaRole.flatMap((ar) => ar.areaRoleFeatures.map((arf) => arf.feature.key));

  return areaPermissions.includes(requiredPermission);
};
