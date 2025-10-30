'use client';

import { createContext, useContext, useMemo } from 'react';

import { UserTenant } from '@/types/user';

type TenantSummary = {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
};

type TenantContextType = {
  tenantId: string;
  userTenant: UserTenant;
  tenants: TenantSummary[];
  currentTenant: TenantSummary | undefined;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children, tenantId, userTenant, tenants }: { children: React.ReactNode; tenantId: string; userTenant: UserTenant; tenants: TenantSummary[] }) => {
  const currentTenant = useMemo(() => tenants.find((t) => t.id === tenantId), [tenants, tenantId]);
  return <TenantContext.Provider value={{ tenantId, userTenant, tenants, currentTenant }}>{children}</TenantContext.Provider>;
};

export const useTenantContext = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};
