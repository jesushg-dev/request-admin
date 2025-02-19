'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { UserForm, userSchema } from './user-form';
import { UserRoleForm, userRoleFormSchema } from './user-role-form';
import { UserTenantForm, userTenantFormSchema } from './user-tenant-form';

const { useStepper, utils } = defineStepper(
  { id: 'user', label: 'User Details', schema: userSchema },
  { id: 'tenant', label: 'Tenant Association', schema: userTenantFormSchema },
  { id: 'role', label: 'Role Assignment', schema: userRoleFormSchema },
  { id: 'summary', label: 'Summary', schema: z.object({}) }
);

export function UserTenantScopedForm() {
  const stepper = useStepper();

  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
    defaultValues: {
      user: { isTwoFactorEnabled: false, isGlobalAdmin: false },
      tenants: [{ isActive: true, isTermAccepted: false, isSuperAdmin: false, personalInfo: {} }],
      roles: [{ roleId: '' }],
    },
  });

  const onSubmit = async (values: z.infer<typeof stepper.current.schema>) => {
    console.log(`Step: ${stepper.current.id}, Values:`, values);
    if (stepper.isLast) {
      stepper.reset();
    } else {
      stepper.next();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden p-6">
        <StepNavigation steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />
        <div className="flex flex-1 overflow-y-hidden">
          <ScrollArea className="w-full flex-1 overflow-y-hidden">
            {stepper.switch({
              user: () => <UserForm />,
              tenant: () => <UserTenantForm />,
              role: () => <UserRoleForm />,
            })}
          </ScrollArea>
        </div>
        <StepperNavigationButtons isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} nextText="Next" submitText="Finish" />
      </form>
    </Form>
  );
}
