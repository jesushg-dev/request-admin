'use client';

import React, { useState, useTransition, type FC } from 'react';
import { upsertCategoriesFlat } from '@/actions/assignment-type';
import { useRouter } from '@/i18n/routing';
import { useUpsertArea } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { RequestLevelType } from '@/types/prisma/hierarchy';
import { ModuleWithFeaturesType } from '@/types/prisma/module';
import { RequirementOptionType } from '@/types/prisma/requirement';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import AreaForm, { areaFormSchema, getAreaDefaultValue } from '@/components/common/area/area-form';
import AssignmentCategoryForm, { categoriesSchema } from '@/components/common/category/assignment-category-form';
import RolesForm, { rolesFormSchema } from '@/components/common/role/role-form';
import UserRoleAssignmentForm, { userRoleAssignmentFormSchema } from '@/components/common/role/user-role-assignment-form';
import { OptionType } from '@/components/select/select';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import AssignmentCategoriesReview from '../category/assignment-categories-review';
import RoleFormReview from '../role/role-form-review';

// Stepper definition
const { useStepper, utils } = defineStepper(
  { id: 'description', label: 'Description', schema: areaFormSchema },
  { id: 'assignmentCategory', label: 'Assignment Category', schema: categoriesSchema },
  { id: 'role', label: 'Role', schema: rolesFormSchema },
  { id: 'user', label: 'User', schema: userRoleAssignmentFormSchema },
  { id: 'finish', label: 'Finish', schema: z.object({}) }
);

export type AreaFormStepperType = z.infer<typeof areaFormSchema> & z.infer<typeof categoriesSchema> & z.infer<typeof rolesFormSchema> & z.infer<typeof userRoleAssignmentFormSchema>;

interface AreaFormStepperProps {
  tenantId: string;
  hierarchyId: string;
  userOptions: OptionType[];
  assignmentLevels: RequestLevelType[];
  requirements: RequirementOptionType[];
  moduleWithFeatures: ModuleWithFeaturesType[];
  defaultValues?: AreaFormStepperType;
}

// AreaFormStepper: Renders stepper and step content
const AreaFormStepper: FC<AreaFormStepperProps> = ({ tenantId, hierarchyId, assignmentLevels, userOptions, moduleWithFeatures, defaultValues }) => {
  const router = useRouter();
  const stepper = useStepper();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertArea();

  // Initialize React Hook Form with current step schema
  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
    defaultValues: defaultValues ? defaultValues : stepper.current.id === 'description' ? getAreaDefaultValue() : {},
  });

  const [roleOptions, setRoleOptions] = useState<OptionType[]>([]);

  // Handle form submission
  const onSubmit = (values: z.infer<typeof stepper.current.schema>) => {
    if (stepper.current.id === 'role' && 'roles' in values) {
      const roles = values.roles.map((role) => ({ value: role.id, label: role.name }));
      setRoleOptions(roles);
    }

    if (!stepper.isLast) {
      stepper.next();
      return;
    }

    startTransition(async () => {
      const data = form.getValues() as AreaFormStepperType;

      const promise = upsert({
        create: {
          tenantId,
          name: data.name,
          description: data.description,
          isActive: data.isActive,
          areaRole: {
            create: data.roles.map((role) => ({
              id: role.id,
              name: role.name,
              description: role.description,
              isActive: role.isActive,
              tenantId,
              areaRoleFeatures: {
                create: role.features.map((feature) => ({
                  tenantId,
                  id: feature.id,
                  isActive: feature.isActive,
                  featureId: feature.featureId,
                })),
              },
            })),
          },
          userAreas: {
            create: data.userRoles.map((userRole) => ({
              tenantId,
              id: userRole.id,
              isActive: userRole.isActive,
              roleId: userRole.roleId.value,
              userTenantId: userRole.userId.value,
            })),
          },
        },
        update: {
          tenantId,
          name: data.name,
          description: data.description,
          isActive: data.isActive,
          areaRole: {
            // Delete all existing roles first
            deleteMany: { areaId: data.id, tenantId },
            // Create new roles with features
            create: data.roles.map((role) => ({
              id: role.id,
              name: role.name,
              description: role.description,
              isActive: role.isActive,
              tenantId,
              areaRoleFeatures: {
                create: role.features.map((feature) => ({
                  tenantId,
                  id: feature.id,
                  isActive: feature.isActive,
                  featureId: feature.featureId,
                })),
              },
            })),
          },
          userAreas: {
            // Delete all existing user areas first
            deleteMany: { areaId: data.id, tenantId },
            // Create new user areas
            create: data.userRoles.map((userRole) => ({
              tenantId,
              id: userRole.id,
              isActive: userRole.isActive,
              roleId: userRole.roleId.value,
              userTenantId: userRole.userId.value,
            })),
          },
        },
        where: { id: data.id, tenantId },
      });

      const upsertCategoriesPromise = promise.then((upsertResponse) => {
        if (!upsertResponse) {
          throw new Error('Failed to save area');
        }
        return upsertCategoriesFlat(data.categories, tenantId, hierarchyId, upsertResponse.id);
      });

      toast.promise(Promise.all([promise, upsertCategoriesPromise]), {
        loading: 'Saving area...',
        success: ([upsertResponse]) => {
          router.push({ pathname: '/admin/[tenantId]/requests-portal/areas', params: { tenantId } });
          return `Area ${upsertResponse?.name} created successfully`;
        },
        error: (error) => {
          return `Failed to save area: ${error.message}`;
        },
      });
    });
  };

  return (
    <div className="flex flex-col flex-1 p-4">
      <Card className="w-full flex flex-col flex-1 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden p-6">
            {error && <PrismaErrorAlert error={error} />}

            <StepNavigation steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />

            {/* Step Content */}
            <div className="flex flex-1 overflow-y-hidden">
              <ScrollArea className="w-full flex-1 overflow-y-hidden">
                {stepper.switch({
                  description: () => <AreaForm />,
                  assignmentCategory: () => (
                    <div className="m-1 mr-4 flex flex-1 flex-col gap-2">
                      <AssignmentCategoryForm levels={assignmentLevels} />
                    </div>
                  ),
                  role: () => <RolesForm moduleWithFeatures={moduleWithFeatures} isBatch={true} />,
                  user: () => <UserRoleAssignmentForm userOptions={userOptions} roleOptions={roleOptions} />,
                  finish: () => (
                    <div className="flex flex-col gap-4">
                      <AssignmentCategoriesReview />
                      <RoleFormReview />
                    </div>
                  ),
                })}
              </ScrollArea>
            </div>

            <StepperNavigationButtons isPending={isPending} isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} />
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default AreaFormStepper;
