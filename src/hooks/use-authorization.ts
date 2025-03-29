// use-authorization.ts (Client Hook)
import { useCallback, useMemo } from 'react';
import { PermissionAction, PermissionActions } from '@/constants/permissions';
import { useSession } from '@/server/auth-client';
import { useFindUniqueUserTenant } from '@/services/api/hooks';

import { UserTenantDefaultArgs, UserTenantWithRelations } from '@/types/prisma/authorization';

export { PermissionActions as PERMISSION } from '@/constants/permissions';

const flattenPermissions = (data: UserTenantWithRelations): PermissionAction[] => {
  const rolePermissions = data.userRoles.flatMap((ur) => ur.role.roleFeature.map((rf) => rf.feature.key as PermissionAction));

  const areaPermissions = data.userAreas.flatMap((ua) => ua.area.areaRole.flatMap((ar) => ar.areaRoleFeatures.map((arf) => arf.feature.key as PermissionAction)));

  return [...new Set([...rolePermissions, ...areaPermissions])];
};

export const useAuthorization = (tenantId: string) => {
  const session = useSession();
  const isPrivilegedUser = useMemo(() => session.data?.user.isGlobalAdmin || ['owner', 'admin'].includes(session.data?.user.role || ''), [session.data?.user]);

  const { data, isLoading, isError } = useFindUniqueUserTenant(
    {
      ...UserTenantDefaultArgs,
      where: { userId_tenantId: { tenantId, userId: session.data?.user.id || '' } },
    },
    { enabled: !!tenantId && !!session.data?.user.id && !isPrivilegedUser }
  );

  // Global permissions (roles + all areas)
  const permissions = useMemo(() => {
    if (isPrivilegedUser) return Object.values(PermissionActions).flatMap((m) => Object.values(m));
    return data ? flattenPermissions(data) : [];
  }, [data, isPrivilegedUser]);

  // Area-specific permissions
  const getAreaPermissions = useCallback(
    (areaId: string): PermissionAction[] => {
      if (isPrivilegedUser) return Object.values(PermissionActions).flatMap((m) => Object.values(m));

      const area = data?.userAreas.find((ua) => ua.area.id === areaId);
      if (!area) return [];

      return Array.from(new Set(area.area.areaRole.flatMap((ar) => ar.areaRoleFeatures.map((arf) => arf.feature.key as PermissionAction))));
    },
    [data, isPrivilegedUser]
  );

  const hasPermission = useCallback((permission: PermissionAction) => isPrivilegedUser || permissions.includes(permission), [permissions, isPrivilegedUser]);

  const hasAreaPermission = useCallback(
    (areaId: string, permission: PermissionAction) => {
      if (isPrivilegedUser) return true;
      return getAreaPermissions(areaId).includes(permission);
    },
    [getAreaPermissions, isPrivilegedUser]
  );

  return {
    hasPermission,
    hasAreaPermission,
    getAreaPermissions,
    isLoading: isPrivilegedUser ? false : isLoading,
    isError: isPrivilegedUser ? false : isError,
    userTenant: {
      isActive: data?.isActive ?? false,
      isTermAccepted: data?.isTermAccepted ?? false,
      role: data?.role ?? '',
    },
    session,
  };
};
