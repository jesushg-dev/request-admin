// StepperNavigationButtonsModern.tsx
import { memo, type FC } from 'react';
import { ChevronLeft, ChevronRight, LoaderCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '../ui/button';

// Define the props for the StepperNavigationButtonsModern component
interface StepperNavigationButtonsModernProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  currentStep: number;
  totalSteps: number;
  isResetAllowed?: boolean; // Optional boolean to determine if the reset button should be shown
  onPrev: () => void;
  onReset?: () => void;
  onNext?: () => void; // Optional function to handle the next button click
  submitText?: string; // Optional custom text for the submit button
  nextText?: string; // Optional custom text for the next button
  isPending?: boolean; // Optional boolean to show a loading spinner on the submit button
}

export const StepperNavigationButtonsModern: FC<StepperNavigationButtonsModernProps> = memo(
  ({ isResetAllowed = false, isPending, isFirstStep, isLastStep, currentStep, totalSteps, onPrev, onNext, onReset, submitText, nextText }) => {
    const t = useTranslations('component.stepper.navigationButtons');

    return (
      <div className="border-t bg-background">
        <div className="max-w-3xl mx-auto w-full flex justify-between items-center p-4">
          {/* Left: Back Button */}
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onPrev} disabled={isFirstStep || isPending}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t('back')}
            </Button>
            {isLastStep && isResetAllowed && onReset && (
              <Button type="button" variant="destructive" onClick={onReset} disabled={isPending}>
                {t('reset')}
              </Button>
            )}
          </div>

          {/* Center: Step Indicator */}
          <div className="text-xs text-muted-foreground font-medium">
            Step {currentStep} of {totalSteps}
          </div>

          {/* Right: Next/Finish Button */}
          {onNext ? (
            <Button type="button" onClick={onNext} disabled={isPending}>
              {isLastStep ? submitText || t('finish') : nextText || t('next')}
              {isPending ? <LoaderCircleIcon className="ml-2 h-4 w-4 animate-spin" /> : !isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          ) : (
            <Button type="submit" disabled={isPending}>
              {isLastStep ? submitText || t('finish') : nextText || t('next')}
              {isPending ? <LoaderCircleIcon className="ml-2 h-4 w-4 animate-spin" /> : !isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    );
  },
);
StepperNavigationButtonsModern.displayName = 'StepperNavigationButtonsModern';

