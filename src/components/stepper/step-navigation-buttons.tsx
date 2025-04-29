// StepperNavigationButtons.tsx
import { memo, type FC } from 'react';
import { LoaderCircleIcon } from 'lucide-react';

import { Button } from '../ui/button';

// Define the props for the StepperNavigationButtons component
interface StepperNavigationButtonsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isResetAllowed?: boolean; // Optional boolean to determine if the reset button should be shown
  onPrev: () => void;
  onReset?: () => void;
  onNext?: () => void; // Optional function to handle the next button click
  submitText?: string; // Optional custom text for the submit button
  nextText?: string; // Optional custom text for the next button
  isPending?: boolean; // Optional boolean to show a loading spinner on the submit button
}

export const StepperNavigationButtons: FC<StepperNavigationButtonsProps> = memo(
  ({ isResetAllowed = false, isPending, isFirstStep, isLastStep, onPrev, onNext, onReset, submitText = 'Finish', nextText = 'Next' }) => {
    return (
      <div className="flex items-center justify-end gap-4">
        {isLastStep && isResetAllowed && onReset && (
          <Button type="button" variant="destructive" onClick={onReset}>
            Reset
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={onPrev} disabled={isFirstStep}>
          Back
        </Button>
        {onNext ? (
          <Button type="button" onClick={onNext} disabled={isPending}>
            {isLastStep ? submitText : nextText} {isPending && <LoaderCircleIcon className="animate-spin" />}
          </Button>
        ) : (
          <Button type="submit" disabled={isPending}>
            {isLastStep ? submitText : nextText} {isPending && <LoaderCircleIcon className="animate-spin" />}
          </Button>
        )}
      </div>
    );
  }
);

StepperNavigationButtons.displayName = 'StepperNavigationButtons';
