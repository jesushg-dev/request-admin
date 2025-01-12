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
}

export const StepNavigation = <TStepId extends string>({ steps, currentId, getIndex, onStepClick }: StepNavigationProps<TStepId>) => {
  const currentStepIndex = getIndex(currentId);

  return (
    <nav aria-label="Steps">
      <ol className="flex items-center gap-x-4">
        {steps.map((step, index, array) => (
          <Fragment key={step.id}>
            <li className="flex items-center gap-x-2">
              <Button type="button" variant={index <= currentStepIndex ? 'default' : 'outline'} className="size-8 rounded-full p-0" onClick={() => onStepClick(step.id)}>
                {index + 1}
              </Button>
              <span className="text-xs font-medium">{step.label}</span>
            </li>
            {index < array.length - 1 && <Separator className={`flex-1 ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
};
