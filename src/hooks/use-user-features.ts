import { useCallback, useMemo } from 'react';
import { PermissionAction } from '@/constants/permissions';
import { useFindManyRoleFeature } from '@/services/api/hooks';
import { useSession } from 'next-auth/react';

import useTenantId from './use-tenant-id';

export const useUserFeatures = () => {
  const session = useSession();
  const tenantId = useTenantId();

  const { data, isLoading, isError } = useFindManyRoleFeature(
    {
      select: {
        feature: { select: { key: true } },
      },
      where: {
        role: {
          userRole: {
            some: {
              userTenant: {
                AND: [{ tenantId }, { userId: session.data?.user.id }],
              },
            },
          },
        },
        tenantId,
      },
    },
    {
      enabled: !!session.data?.user.id,
    }
  );

  const features = useMemo(() => {
    if (!data) return [];
    return data.map((roleFeature) => roleFeature.feature.key);
  }, [data]);

  const checkPermission = useCallback((permission: PermissionAction) => features.includes(permission), [features]);

  return { isLoading, isError, features, checkPermission };
};
