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

import { UserForm } from './user-form';
import { UserRoleForm } from './user-role-form';
import { UserTenantForm } from './user-tenant-form';

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be at most 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  isTwoFactorEnabled: z.boolean(),
  isGlobalAdmin: z.boolean(),
});

const userTenantSchema = z.object({
  isActive: z.boolean(),
  isTermAccepted: z.boolean(),
  isSuperAdmin: z.boolean(),
  tenantId: z.string().uuid('Invalid tenant ID'),
  personalInfo: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z.string().optional(),
    identificationNumber: z.string().min(1, 'Identification number is required'),
    identificationTypeId: z.string().uuid('Invalid identification type ID'),
  }),
});

const userRoleSchema = z.object({
  roleId: z.string().uuid('Invalid role ID'),
});

const { useStepper, utils } = defineStepper(
  { id: 'user', label: 'User Details', schema: userSchema },
  { id: 'tenant', label: 'Tenant Association', schema: userTenantSchema },
  { id: 'role', label: 'Role Assignment', schema: userRoleSchema }
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

  const onSubmit = (values) => {
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
