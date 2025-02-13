'use client';

import type React from 'react';
import { createContext, useContext, useState, type ReactNode } from 'react';

export interface ChildStep {
  id: string;
  label: string;
  description?: string | null;
  status: 'pending' | 'completed' | 'error';
}

export type ChildSteps = Record<string, ChildStep[]>;

interface ChildStepsContextType {
  steps: ChildSteps;
  currentChildStepIndex: number;
  setSteps: React.Dispatch<React.SetStateAction<ChildSteps>>;
  setCurrentChildStepIndex: React.Dispatch<React.SetStateAction<number>>;
  addChildStep: (parentStepId: string, newChildStep: ChildStep) => void;
  setChildrenSteps: (parentStepId: string, childSteps: ChildStep[]) => void;
  removeChildStep: (parentStepId: string, childStepId: string) => void;
  updateChildStepStatus: (parentStepId: string, childStepId: string, status: ChildStep['status']) => void;
}

const ChildStepsContext = createContext<ChildStepsContextType | undefined>(undefined);

export const ChildStepsProvider: React.FC<{ children: ReactNode; initialSteps: ChildSteps }> = ({ children, initialSteps }) => {
  const [steps, setSteps] = useState<ChildSteps>(initialSteps);
  const [currentChildStepIndex, setCurrentChildStepIndex] = useState(0);

  const addChildStep = (parentStepId: string, newChildStep: ChildStep) => {
    setSteps((prevSteps) => ({
      ...prevSteps,
      [parentStepId]: [...(prevSteps[parentStepId] || []), newChildStep],
    }));
  };

  const setChildrenSteps = (parentStepId: string, childSteps: ChildStep[]) => {
    setSteps((prevSteps) => ({
      ...prevSteps,
      [parentStepId]: childSteps,
    }));
  };

  const removeChildStep = (parentStepId: string, childStepId: string) => {
    setSteps((prevSteps) => ({
      ...prevSteps,
      [parentStepId]: (prevSteps[parentStepId] || []).filter((childStep) => childStep.id !== childStepId),
    }));
  };

  const updateChildStepStatus = (parentStepId: string, childStepId: string, status: ChildStep['status']) => {
    setSteps((prevSteps) => ({
      ...prevSteps,
      [parentStepId]: (prevSteps[parentStepId] || []).map((childStep) => (childStep.id === childStepId ? { ...childStep, status } : childStep)),
    }));
  };

  return (
    <ChildStepsContext.Provider
      value={{
        steps,
        currentChildStepIndex,
        setSteps,
        setCurrentChildStepIndex,
        addChildStep,
        setChildrenSteps,
        removeChildStep,
        updateChildStepStatus,
      }}>
      {children}
    </ChildStepsContext.Provider>
  );
};

export const useChildSteps = () => {
  const context = useContext(ChildStepsContext);
  if (context === undefined) {
    throw new Error('useChildSteps must be used within a ChildStepsProvider');
  }
  return context;
};
