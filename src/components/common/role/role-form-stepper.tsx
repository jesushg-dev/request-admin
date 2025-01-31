'use client';

import React, { FC } from 'react';
import { useCreateRole, useUpdateRole } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ModuleWithFeaturesType } from '@/types/prisma/module';
import { RequirementOptionType } from '@/types/prisma/requirement';
import useFormSubmit from '@/hooks/use-form-submit';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserRoleAssignmentForm, { userRoleFormSchema } from '@/components/common/role/user-role-assignment-form';
import { OptionType } from '@/components/select/select';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { generateUuid } from '../../../../prisma/util';
import RoleForm, { DEFAULT_ROLE, rolesFormSchema } from './role-form';
import RoleFormReview from './role-form-review';

// Stepper definition
const { useStepper, utils } = defineStepper(
  { id: 'role', label: 'Role', schema: rolesFormSchema },
  { id: 'user', label: 'User', schema: userRoleFormSchema },
  { id: 'finish', label: 'Finish', schema: z.object({}) }
);

export type RoleFormStepperType = z.infer<typeof rolesFormSchema & typeof userRoleFormSchema>;

interface RoleFormStepperProps {
  tenantId: string;
  userOptions: OptionType[];
  requirements: RequirementOptionType[];
  moduleWithFeatures: ModuleWithFeaturesType[];
  initialValues?: (RoleFormStepperType & { id: string }) | null;
}

// RoleFormStepper: Renders stepper and step content
const RoleFormStepper: FC<RoleFormStepperProps> = ({ tenantId, userOptions, moduleWithFeatures, initialValues }) => {
  const stepper = useStepper();

  const { mutateAsync: createRole } = useCreateRole();
  const { mutateAsync: updateRole } = useUpdateRole();

  const submitCreate = useFormSubmit(createRole, {
    redirectUrl: { pathname: '/admin/[tenantId]/security/roles', params: { tenantId } },
  });
  const submitUpdate = useFormSubmit(updateRole, {
    redirectUrl: { pathname: '/admin/[tenantId]/security/roles', params: { tenantId } },
  });

  // Initialize React Hook Form with current step schema
  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
    defaultValues: stepper.current.id === 'role' ? { roles: initialValues?.roles ?? [DEFAULT_ROLE], userRoles: initialValues?.userRoles ?? [] } : {},
  });

  // Handle form submission
  const onSubmit = () => {
    if (!stepper.isLast) {
      stepper.next();
      return;
    }

    const data = form.getValues() as unknown as RoleFormStepperType;

    if (initialValues?.id) {
      submitUpdate({
        data: {
          id: initialValues.id,
          tenantId,
          name: data.roles[0].name,
          description: data.roles[0].description,
          isActive: data.roles[0].isActive,
          userRole: {
            upsert: data.userRoles.map((userRole) => ({
              where: { id: userRole.id ?? generateUuid(), tenantId },
              update: { tenantId, isActive: userRole.isActive, userTenantId: userRole.userId.value },
              create: { tenantId, isActive: userRole.isActive, userTenantId: userRole.userId.value },
            })),
          },
          roleFeature: {
            upsert: data.roles[0].features.map((feature) => ({
              where: { id: feature.id ?? generateUuid(), tenantId },
              update: { tenantId, featureId: feature.featureId, isActive: feature.isActive },
              create: { tenantId, isActive: feature.isActive, featureId: feature.featureId },
            })),
          },
        },
        where: { id: initialValues.id },
      });
      return;
    }

    submitCreate({
      data: {
        tenantId,
        name: data.roles[0].name,
        description: data.roles[0].description,
        isActive: data.roles[0].isActive,
        userRole: {
          createMany: {
            data: data.userRoles.map((userRole) => ({ tenantId, isActive: userRole.isActive, userTenantId: userRole.userId.value })),
          },
        },
        roleFeature: {
          createMany: {
            data: data.roles[0].features.map((feature) => ({ tenantId, isActive: feature.isActive, featureId: feature.featureId })),
          },
        },
      },
    });
  };

  return (
    <div className="flex flex-col flex-1 p-4">
      <Card className="w-full flex flex-col flex-1 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden p-6">
            <StepNavigation steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />

            {/* Step Content */}
            <div className="flex flex-1 overflow-y-hidden">
              <ScrollArea className="w-full flex-1 overflow-y-hidden">
                {stepper.switch({
                  role: () => <RoleForm moduleWithFeatures={moduleWithFeatures} />,
                  user: () => <UserRoleAssignmentForm userOptions={userOptions} roleArray={[]} predefinedRole="predefined" />,
                  finish: () => <RoleFormReview />,
                })}
              </ScrollArea>
            </div>

            <StepperNavigationButtons isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} nextText="Next" submitText="Finish" />
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default RoleFormStepper;
