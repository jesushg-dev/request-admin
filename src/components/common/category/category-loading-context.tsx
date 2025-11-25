'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type LoadingState = Record<number, boolean>;

interface CategoryLoadingContextValue {
  setLevelLoading: (position: number, isLoading: boolean) => void;
  isLevelReady: (position: number) => boolean;
  isPreviousLevelReady: (position: number) => boolean;
  reset: () => void;
}

const CategoryLoadingContext = createContext<CategoryLoadingContextValue | undefined>(undefined);

export const CategoryLoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({});

  const setLevelLoading = useCallback((position: number, isLoading: boolean) => {
    setLoadingState((prev) => ({
      ...prev,
      [position]: isLoading,
    }));
  }, []);

  const isLevelReady = useCallback(
    (position: number) => {
      return !loadingState[position];
    },
    [loadingState]
  );

  const isPreviousLevelReady = useCallback(
    (position: number) => {
      // Level 0 (position 0) is always ready (it's the root)
      if (position === 0) return true;
      
      // Check if the previous level (position - 1) is ready
      // If previous level is not in state, assume it's ready (initial state)
      const previousPosition = position - 1;
      return loadingState[previousPosition] === false || loadingState[previousPosition] === undefined;
    },
    [loadingState]
  );

  const reset = useCallback(() => {
    setLoadingState({});
  }, []);

  return (
    <CategoryLoadingContext.Provider
      value={{
        setLevelLoading,
        isLevelReady,
        isPreviousLevelReady,
        reset,
      }}>
      {children}
    </CategoryLoadingContext.Provider>
  );
};

export const useCategoryLoading = () => {
  const context = useContext(CategoryLoadingContext);
  if (!context) {
    throw new Error('useCategoryLoading must be used within CategoryLoadingProvider');
  }
  return context;
};

