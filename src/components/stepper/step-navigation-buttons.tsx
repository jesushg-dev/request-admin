// StepperNavigationButtons.tsx
import React from 'react';
import { LoaderCircleIcon } from 'lucide-react';

import { Button } from '../ui/button';

// Define the props for the StepperNavigationButtons component
interface StepperNavigationButtonsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  onPrev: () => void;
  onReset: () => void;
  submitText?: string; // Optional custom text for the submit button
  nextText?: string; // Optional custom text for the next button
  isPending?: boolean; // Optional boolean to show a loading spinner on the submit button
}

export const StepperNavigationButtons: React.FC<StepperNavigationButtonsProps> = ({ isPending, isFirstStep, isLastStep, onPrev, onReset, submitText = 'Finish', nextText = 'Next' }) => {
  return (
    <div className="flex items-center justify-end gap-4">
      {isLastStep ? (
        <Button onClick={onReset}>Reset</Button>
      ) : (
        <Button
          variant="secondary"
          onClick={() => {
            console.log('🚀 ~ file: step-navigation-buttons.tsx ~ line 33 ~ StepperNavigationButtons ~ disabled', isFirstStep);
            onPrev();
          }}
          disabled={isFirstStep}>
          Back
        </Button>
      )}
      <Button type="submit" disabled={isPending}>
        {isLastStep ? submitText : nextText} {isPending && <LoaderCircleIcon className="animate-spin" />}
      </Button>
    </div>
  );
};
