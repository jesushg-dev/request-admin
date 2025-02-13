'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { useChildSteps, type ChildStep } from './child-steps-context';

const MAX_VISIBLE_CHILD_STEPS = 5;

export const ChildSteps: FC<{ index: number; currentIndex: number; currentId: string }> = ({ index, currentIndex, currentId }) => {
  const { steps, currentChildStepIndex, setCurrentChildStepIndex } = useChildSteps();

  const [childStepOffset, setChildStepOffset] = useState(0);

  useEffect(() => {
    const newOffset = Math.floor(currentChildStepIndex / MAX_VISIBLE_CHILD_STEPS) * MAX_VISIBLE_CHILD_STEPS;
    setChildStepOffset(newOffset);
  }, [currentChildStepIndex]);

  const handlePrevChildSteps = () => {
    setChildStepOffset(Math.max(0, childStepOffset - MAX_VISIBLE_CHILD_STEPS));
  };

  const handleNextChildSteps = () => {
    const currentChildSteps = steps[currentId];
    setChildStepOffset(Math.min(childStepOffset + MAX_VISIBLE_CHILD_STEPS, currentChildSteps.length - MAX_VISIBLE_CHILD_STEPS));
  };

  const currentStep = steps[currentId] ?? [];

  if (index !== currentIndex || currentStep.length <= 1) {
    return null;
  }

  return (
    <div className="mt-2 flex items-center space-x-1">
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center space-x-1">
          {childStepOffset > 0 && (
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={handlePrevChildSteps}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {currentStep.slice(childStepOffset, childStepOffset + MAX_VISIBLE_CHILD_STEPS).map((childStep, childIndex) => (
            <ChildStepIndicator
              key={childStep.id}
              childStep={childStep}
              isActive={childIndex + childStepOffset === currentChildStepIndex}
              onClick={() => setCurrentChildStepIndex(childIndex + childStepOffset)}
            />
          ))}
          {childStepOffset + MAX_VISIBLE_CHILD_STEPS < currentStep.length && (
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={handleNextChildSteps}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const ChildStepIndicator: React.FC<{
  childStep: ChildStep;
  isActive: boolean;
  onClick: () => void;
}> = ({ childStep, isActive, onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div onClick={onClick} className="cursor-pointer">
            <motion.button
              type="button"
              className={cn(
                'w-3 h-3 rounded-full transition-colors flex items-center justify-center',
                isActive ? 'bg-blue-500 border-2 border-blue-300' : childStep.status === 'completed' ? 'bg-green-500' : childStep.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
              )}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}>
              {isActive && <motion.div className="w-1 h-1 bg-white rounded-full" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }} />}
              {childStep.status === 'completed' && <Check className="w-2 h-2 text-white" />}
              {childStep.status === 'error' && <AlertTriangle className="w-2 h-2 text-white" />}
            </motion.button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{childStep.label}</p>
          <p className="text-sm text-gray-500">{childStep.description}</p>
          <p className="text-sm font-medium mt-1">Status: {childStep.status.charAt(0).toUpperCase() + childStep.status.slice(1)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
