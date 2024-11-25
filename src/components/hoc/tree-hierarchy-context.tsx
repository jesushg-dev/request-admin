// TreeHierarchyContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';

interface TreeHierarchyContextValue {
  userId?: string;
}

const TreeHierarchyContext = createContext<TreeHierarchyContextValue | undefined>(undefined);

export const useTreeHierarchyContext = () => {
  const context = useContext(TreeHierarchyContext);
  if (context === undefined) {
    throw new Error('useTreeHierarchyContext must be used within a TreeHierarchyProvider');
  }
  return context;
};

export const TreeHierarchyProvider: React.FC<TreeHierarchyContextValue & { children: ReactNode }> = ({ children, userId }) => {
  return <TreeHierarchyContext.Provider value={{ userId }}>{children}</TreeHierarchyContext.Provider>;
};
