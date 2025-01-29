'use client';

import React from 'react';
import { PermissionAction } from '@/constants/permissions';

import { useUserFeatures } from '@/hooks/use-user-features';

interface RoleGateProps {
  feature: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGate = ({ children, feature, fallback }: RoleGateProps) => {
  const { isLoading, checkPermission } = useUserFeatures();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!checkPermission(feature)) {
    return <>{fallback ?? <div>Access Denied</div>}</>;
  }

  return <>{children}</>;
};
