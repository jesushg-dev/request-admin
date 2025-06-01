'use client';

import { createContext, useContext } from 'react';

type TenantContextType = {
  tenantId: string;
  userTenantId: string;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children, tenantId, userTenantId }: { children: React.ReactNode; tenantId: string; userTenantId: string }) => {
  return <TenantContext.Provider value={{ tenantId, userTenantId }}>{children}</TenantContext.Provider>;
};

export const useTenantContext = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};
