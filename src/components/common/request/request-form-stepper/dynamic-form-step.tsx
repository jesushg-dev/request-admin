'use client';

import { type FC } from 'react';
import { useFindManyForm } from '@/services/api/hooks';
import { defineStepper } from '@stepperize/react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import FormRenderer from '@/components/builder-form/form-renderer';

export const dynamicFormSchema = z.object({
  dynamicForms: z.record(z.string()),
});

export type DynamicFormValues = z.infer<typeof dynamicFormSchema>;

interface DynamicFormStepProps {
  requestCategoryIds: string[];
}

const { useStepper, utils } = defineStepper(
  {
    id: 'shipping',
    title: 'Shipping',
    description: 'Enter your shipping details',
  },
  {
    id: 'payment',
    title: 'Payment',
    description: 'Enter your payment details',
  },
  {
    id: 'comfirmation',
    title: 'Confirmation',
    description: 'Confirm your order',
  },
  {
    id: 'address',
    title: 'Address',
    description: 'Enter your address',
  },
  {
    id: 'card',
    title: 'Card',
    description: 'Enter your card details',
  },
  {
    id: 'complete',
    title: 'Complete',
    description: 'Stepper complete',
  }
);

const DynamicFormStep: FC<DynamicFormStepProps> = ({ requestCategoryIds }) => {
  const { control, setValue, watch } = useFormContext<DynamicFormValues>();

  const { data, isLoading } = useFindManyForm({
    select: { id: true, name: true, content: true },
    where: {
      isPublic: true,
      categoryForms: { every: { categoryId: { in: requestCategoryIds } } },
    },
  });
  console.log('🚀 ~ data:', data);

  const stepper = useStepper();

  const currentIndex = utils.getIndex(stepper.current.id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <StepIndicator currentStep={currentIndex + 1} totalSteps={stepper.all.length} />
        <div className="flex flex-col">
          <h2 className="flex-1 text-lg font-medium">{stepper.current.title}</h2>
          <p className="text-sm text-muted-foreground">{stepper.current.description}</p>
        </div>
      </div>
      <div className="m-1 flex flex-col gap-2">
        {/*data?.map((form) => (
          <FormRenderer
            isSubmitting={pending}
            content={content}
            onSubmit={(jsonContent) => {
              startTransition(submitForm.bind(null, jsonContent));
            }}
          />
        ))*/}
      </div>
      ;{stepper.switch({})}
      <div className="space-y-4">
        {!stepper.isLast ? (
          <div className="flex justify-end gap-4">
            <Button variant="secondary" onClick={stepper.prev} disabled={stepper.isFirst}>
              Back
            </Button>
            <Button onClick={stepper.next}>{stepper.isLast ? 'Complete' : 'Next'}</Button>
          </div>
        ) : (
          <Button onClick={stepper.reset}>Reset</Button>
        )}
      </div>
    </div>
  );
};

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  size?: number;
  strokeWidth?: number;
}

const StepIndicator = ({ currentStep, totalSteps, size = 80, strokeWidth = 6 }: StepIndicatorProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const fillPercentage = (currentStep / totalSteps) * 100;
  const dashOffset = circumference - (circumference * fillPercentage) / 100;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        <title>Step Indicator</title>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted-foreground" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="text-primary transition-all duration-300 ease-in-out"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium" aria-live="polite">
          {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  );
};

export default DynamicFormStep;
