import { Fragment } from 'react';

import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface Step<TStepId extends string> {
  id: TStepId;
  label: string;
}

interface StepNavigationProps<TStepId extends string> {
  steps: Step<TStepId>[];
  currentId: TStepId;
  getIndex: (index: TStepId) => number;
  onStepClick: (stepId: TStepId) => void;
  isNavigationEnabled?: boolean;
  children?: (index: number, currentIndex: number) => React.ReactNode;
  t?: (t: string) => string;
}

export const StepNavigation = <TStepId extends string>({ children, steps, currentId, getIndex, onStepClick, isNavigationEnabled, t }: StepNavigationProps<TStepId>) => {
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
                <span className="text-xs font-medium">{t ? t(step.label) : step.label}</span>
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

export const StepNavigationModern = <TStepId extends string>({ children, steps, currentId, getIndex, onStepClick, isNavigationEnabled, t }: StepNavigationProps<TStepId>) => {
  const currentStepIndex = getIndex(currentId);

  const onHandleStepClick = (stepId: TStepId, isAhead: boolean) => {
    if (isNavigationEnabled || isAhead) {
      onStepClick(stepId);
    }
  };

  return (
    <nav aria-label="Steps" className="w-full mb-6">
      <div className="flex w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const segmentWidth = 100 / steps.length;
          const isAhead = currentStepIndex >= index;
          const isClickable = isNavigationEnabled || isAhead;

          return (
            <div key={step.id} className="flex flex-col items-center" style={{ width: `${segmentWidth}%` }}>
              {/* Progress bar segment */}
              <button
                type="button"
                onClick={() => onHandleStepClick(step.id, isAhead)}
                disabled={!isClickable}
                className={`w-full h-2 transition-colors ${isCompleted ? 'bg-primary' : isActive ? 'bg-destructive' : 'bg-muted'} ${index === 0 ? 'rounded-l-full' : ''} ${
                  index === steps.length - 1 ? 'rounded-r-full' : ''
                } ${!isClickable ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                aria-label={`Go to step: ${t ? t(step.label) : step.label}`}
              />

              {/* Step label */}
              <button
                type="button"
                onClick={() => onHandleStepClick(step.id, isAhead)}
                disabled={!isClickable}
                className={`mt-1 text-xs transition-colors ${
                  isCompleted ? 'text-primary font-medium' : isActive ? 'text-destructive font-bold' : 'text-muted-foreground'
                } ${!isClickable ? 'cursor-not-allowed' : 'cursor-pointer'} 
                  hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded px-1`}>
                {t ? t(step.label) : step.label}
              </button>

              {/* Additional content */}
              {children && children(index, currentStepIndex)}
            </div>
          );
        })}
      </div>
    </nav>
  );
};
