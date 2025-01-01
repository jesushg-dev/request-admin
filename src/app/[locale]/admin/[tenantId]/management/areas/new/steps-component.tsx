'use client';

import React, { FC } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { LevelType } from '@/types/prisma/hierarchy';
import { ModuleWithFeaturesType } from '@/types/prisma/module';
import { RequirementOptionType } from '@/types/prisma/requirement';
import { UserType } from '@/types/prisma/user';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import AreaForm, { areaFormSchema } from '@/components/common/area/area-form';
import CategoryForm, { categoryFormSchema } from '@/components/common/category/category-form';
import AreaRolesForm, { areaRolesFormSchema } from '@/components/common/role/role-form';
import UserRoleAssignmentForm, { userRoleFormSchema } from '@/components/common/role/user-role-assignment-form';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

// Stepper definition
const { useStepper, steps } = defineStepper(
  { id: 'description', label: 'Description', schema: areaFormSchema },
  { id: 'assignationCategory', label: 'Assignation Category', schema: categoryFormSchema },
  { id: 'role', label: 'Role', schema: areaRolesFormSchema },
  { id: 'user', label: 'User', schema: userRoleFormSchema },
  { id: 'finish', label: 'Finish', schema: z.object({}) }
);

interface StepsComponentProps {
  users: UserType[];
  levels: LevelType[];
  requirements: RequirementOptionType[];
  moduleWithFeatures: ModuleWithFeaturesType[];
}

// StepsComponent: Renders stepper and step content
const StepsComponent: FC<StepsComponentProps> = ({ levels, requirements, users, moduleWithFeatures }) => {
  const stepper = useStepper();

  // Initialize React Hook Form with current step schema
  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
  });

  // Handle form submission
  const onSubmit = (values: any) => {
    console.log(`Step: ${stepper.current.id}, Values:`, values);
    if (stepper.isLast) {
      stepper.reset();
    } else {
      stepper.next();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden rounded-lg border p-6">
        <StepNavigation steps={stepper.all} currentStepIndex={stepper.current.index} onStepClick={stepper.goTo} />

        {/* Step Content */}
        <div className="flex flex-1 overflow-y-hidden">
          <ScrollArea className="w-full flex-1 overflow-y-hidden">
            {stepper.switch({
              description: () => <AreaForm />,
              assignationCategory: () => (
                <div className="m-1 mr-4 flex flex-1 flex-col gap-2">
                  <CategoryForm levels={levels} requirements={requirements} />
                </div>
              ),
              role: () => <AreaRolesForm moduleWithFeatures={moduleWithFeatures} />,
              user: () => <UserRoleAssignmentForm userArray={users} roleArray={[]} />,
              finish: () => <div>Finish</div>,
            })}
          </ScrollArea>
        </div>

        <StepperNavigationButtons isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onNext={stepper.next} nextText="Next" submitText="Finish" />
      </form>
    </Form>
  );
};

export default StepsComponent;
