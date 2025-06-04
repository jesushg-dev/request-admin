'use client';

import { createContext, useContext } from 'react';

import { UserTenant } from '@/types/user';

type TenantContextType = {
  tenantId: string;
  userTenant: UserTenant;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children, tenantId, userTenant }: { children: React.ReactNode; tenantId: string; userTenant: UserTenant }) => {
  return <TenantContext.Provider value={{ tenantId, userTenant }}>{children}</TenantContext.Provider>;
};

export const useTenantContext = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};
