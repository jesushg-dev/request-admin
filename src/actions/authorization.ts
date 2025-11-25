'use server';

import { PermissionAction } from '@/constants/permissions';
import { requireUser } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { UserTenantDefaultArgs } from '@/types/zenstackhq/authorization';

class AuthorizationError extends Error {}

type AuthResult = {
  isAdmin: boolean;
  hasPermissions: (required: PermissionAction | PermissionAction[], options?: { requireAll?: boolean }) => boolean;
  hasAreaPermissions: (areaId: string, required: PermissionAction | PermissionAction[], options?: { requireAll?: boolean }) => boolean;
};

export const getAuthContext = async (tenantId: string): Promise<AuthResult> => {
  const user = await requireUser();
  if (!user) throw new AuthorizationError('Unauthorized');

  // Local cache is used to avoid multiple database calls for the same user in the same request
  let permissionsCache: Set<string> | null = null;
  const areaPermissionsCache = new Map<string, Set<string>>();

  const isAdmin = user.isGlobalAdmin || ['owner', 'admin'].includes(user.role || '');

  const loadPermissions = async () => {
    if (permissionsCache) return;

    const db = await getDb();
    const userTenant = await db.userTenant.findUnique({
      ...UserTenantDefaultArgs,
      where: { userId_tenantId: { userId: user.id, tenantId } },
    });

    if (!userTenant) {
      permissionsCache = new Set();
      return;
    }

    // Global permissions are loaded from user roles and areas
    const rolePerms = userTenant.userRoles.flatMap((ur) => ur.role.roleFeature.map((rf) => rf.feature.key));
    const areaPerms = userTenant.userAreas.flatMap((ua) => ua.area.areaRole.flatMap((ar) => ar.areaRoleFeatures.map((arf) => arf.feature.key)));

    permissionsCache = new Set([...rolePerms, ...areaPerms]);

    // area cache
    userTenant.userAreas.forEach((ua) => {
      const areaPerms = ua.area.areaRole.flatMap((ar) => ar.areaRoleFeatures.map((arf) => arf.feature.key));
      areaPermissionsCache.set(ua.area.id, new Set(areaPerms));
    });
  };

  await loadPermissions();

  return {
    isAdmin,

    hasPermissions: (required, options = {}) => {
      if (isAdmin) return true;

      const checkPermissions = Array.isArray(required) ? required : [required];
      return options.requireAll ? checkPermissions.every((p) => permissionsCache?.has(p)) : checkPermissions.some((p) => permissionsCache?.has(p));
    },

    hasAreaPermissions: (areaId, required, options = {}) => {
      if (isAdmin) return true;

      const areaPerms = areaPermissionsCache.get(areaId);
      if (!areaPerms) return false;

      const checkPermissions = Array.isArray(required) ? required : [required];
      return options.requireAll ? checkPermissions.every((p) => areaPerms.has(p)) : checkPermissions.some((p) => areaPerms.has(p));
    },
  };
};

// how to use getAuthContext in a server component
/*
import { getAuthContext } from '@/lib/auth';

async function ProtectedComponent({ tenantId }) {
  const auth = await getAuthContext(tenantId);
  
  if (!auth.hasPermissions(['VIEW_DASHBOARD'])) {
    return <Unauthorized />;
  }

  return (
    <div>
      {auth.hasPermissions(['EDIT_CONTENT']) && <Editor />}
      {auth.hasAreaPermissions('projects-area', ['MANAGE_TASKS']) && <ProjectManager />}
    </div>
  );
}
*/
