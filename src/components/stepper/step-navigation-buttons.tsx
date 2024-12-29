// StepperNavigationButtons.tsx
import React from 'react';

import { Button } from '../ui/button';

// Define the props for the StepperNavigationButtons component
interface StepperNavigationButtonsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  onPrev: () => void;
  onNext: () => void;
  submitText?: string; // Optional custom text for the submit button
  nextText?: string; // Optional custom text for the next button
}

export const StepperNavigationButtons: React.FC<StepperNavigationButtonsProps> = ({ isFirstStep, isLastStep, onPrev, onNext, submitText = 'Finish', nextText = 'Next' }) => {
  return (
    <div className="flex justify-end gap-4">
      <Button type="button" variant="outline" onClick={onPrev} disabled={isFirstStep}>
        Back
      </Button>
      <Button type="submit">{isLastStep ? submitText : nextText}</Button>
    </div>
  );
};
