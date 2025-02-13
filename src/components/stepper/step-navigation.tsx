// StepNavigation.tsx

import { Fragment } from 'react';

import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

// Define a generic type for each step
interface Step<TStepId extends string> {
  id: TStepId;
  label: string;
}

// Define the props for the StepNavigation component with a generic
interface StepNavigationProps<TStepId extends string> {
  steps: Step<TStepId>[];
  currentId: TStepId;
  getIndex: (index: TStepId) => number;
  onStepClick: (stepId: TStepId) => void;
  isNavigationEnabled?: boolean;
  children?: (index: number, currentIndex: number) => React.ReactNode;
}

export const StepNavigation = <TStepId extends string>({ children, steps, currentId, getIndex, onStepClick, isNavigationEnabled }: StepNavigationProps<TStepId>) => {
  const currentStepIndex = getIndex(currentId);

  const onHandleStepClick = (stepId: TStepId, isAhead: boolean) => {
    if (isNavigationEnabled || isAhead) {
      onStepClick(stepId);
    }
  };

  return (
    <nav aria-label="Steps" className="w-full">
      <ol className="flex items-center gap-4">
        {steps.map((step, index, array) => (
          <Fragment key={step.id}>
            <li className="flex items-center gap-2 flex-col">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={index <= currentStepIndex ? 'default' : 'outline'}
                  className={`size-8 rounded-full p-0" ${currentStepIndex >= index ? 'cursor-pointer' : ''}`}
                  onClick={() => onHandleStepClick(step.id, currentStepIndex >= index)}>
                  {index + 1}
                </Button>
                <span className="text-xs font-medium">{step.label}</span>
              </div>
              {children && children(index, currentStepIndex)}
            </li>
            {index < array.length - 1 && <Separator className={`flex-1 ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
};
