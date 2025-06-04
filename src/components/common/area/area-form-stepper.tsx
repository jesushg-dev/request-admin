'use client';

import React, { useState, useTransition, type FC } from 'react';
import { upsertCategoriesFlat } from '@/actions/assignment-type';
import { useRouter } from '@/i18n/routing';
import { useUpsertArea } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AssignmentHierarchyWithLevelsType } from '@/types/prisma/hierarchy';
import { ModuleWithFeaturesType } from '@/types/prisma/module';
import { RequirementOptionType } from '@/types/prisma/requirement';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import AreaForm, { areaFormSchema, getAreaDefaultValue } from '@/components/common/area/area-form';
import AssignmentCategoryForm, { categoriesSchema } from '@/components/common/category/assignment-category-form';
import RolesForm, { rolesFormSchema } from '@/components/common/role/role-form';
import UserRoleAssignmentForm, { userRoleAssignmentFormSchema } from '@/components/common/role/user-role-assignment-form';
import { OptionType } from '@/components/custom-ui/select';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';
import { StepNavigationModern } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import AssignmentCategoriesReview from '../category/assignment-categories-review';
import RoleFormReview from '../role/role-form-review';

// Stepper definition
const { useStepper, utils } = defineStepper(
  { id: 'description', label: 'steps.description', schema: areaFormSchema },
  { id: 'assignmentCategory', label: 'steps.assignmentCategory', schema: categoriesSchema },
  { id: 'role', label: 'steps.role', schema: rolesFormSchema },
  { id: 'user', label: 'steps.user', schema: userRoleAssignmentFormSchema },
  { id: 'finish', label: 'steps.finish', schema: z.object({}) }
);

export type AreaFormStepperType = z.infer<typeof areaFormSchema> & z.infer<typeof categoriesSchema> & z.infer<typeof rolesFormSchema> & z.infer<typeof userRoleAssignmentFormSchema>;

interface AreaFormStepperProps {
  tenantId: string;
  defaultValues?: AreaFormStepperType;
  requirements: RequirementOptionType[];
  moduleWithFeatures: ModuleWithFeaturesType[];
  assignmentHierarchies: AssignmentHierarchyWithLevelsType[];
  userOptions: OptionType[];
}

// AreaFormStepper: Renders stepper and step content
const AreaFormStepper: FC<AreaFormStepperProps> = ({ tenantId, assignmentHierarchies, userOptions, moduleWithFeatures, defaultValues }) => {
  const router = useRouter();
  const stepper = useStepper();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertArea();
  const [selectedHierarchy, setSelectedHierarchy] = useState<AssignmentHierarchyWithLevelsType | null>(null);
  const t = useTranslations('admin.area.create');

  // Initialize React Hook Form with current step schema
  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
    defaultValues: defaultValues ? defaultValues : stepper.current.id === 'description' ? getAreaDefaultValue() : {},
  });

  const [roleOptions, setRoleOptions] = useState<OptionType[]>([]);

  // Handle form submission
  const onSubmit = (values: z.infer<typeof stepper.current.schema>) => {
    if (stepper.current.id === 'description' && 'hierarchyId' in values) {
      const hierarchy = assignmentHierarchies.find((h) => h.id === values.hierarchyId.value);
      if (!hierarchy) {
        form.setError('root.description.hierarchyId', { message: 'Invalid hierarchy' });
        return;
      }
      setSelectedHierarchy(hierarchy);
    }

    if (stepper.current.id === 'role' && 'roles' in values) {
      const roles = values.roles.map((role) => ({ value: role.id, label: role.name }));
      setRoleOptions(roles);
    }

    if (!stepper.isLast) {
      stepper.next();
      return;
    }

    //check there is a valid hierarchy
    if (!selectedHierarchy) {
      form.setError('root.description.hierarchyId', { message: 'Invalid hierarchy' });
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
        return upsertCategoriesFlat(data.categories, tenantId, selectedHierarchy.id, upsertResponse.id);
      });

      toast.promise(Promise.all([promise, upsertCategoriesPromise]), {
        loading: t('messages.saving'),
        success: ([upsertResponse]) => {
          router.push({ pathname: '/admin/[tenantId]/configurations/areas', params: { tenantId } });
          return t('messages.success', { name: upsertResponse?.name ?? 'N/A' });
        },
        error: (error) => {
          return t('messages.error', { error: error.message });
        },
      });
    });
  };

  return (
    <div className="flex flex-col flex-1 p-4">
      <StepNavigationModern t={t as typeof t & ((key: string) => string)} steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between gap-4 overflow-hidden">
          {error && <PrismaErrorAlert error={error} />}
          {stepper.switch({
            description: () => <AreaForm assignmentHierarchies={assignmentHierarchies} />,
            assignmentCategory: () => (
              <ScrollArea className="w-full flex-1 overflow-y-hidden">
                <div className="m-1 mr-4 flex flex-1 flex-col gap-2">{selectedHierarchy && <AssignmentCategoryForm levels={selectedHierarchy.levels} />}</div>
              </ScrollArea>
            ),
            role: () => <RolesForm moduleWithFeatures={moduleWithFeatures} isBatch={true} />,
            user: () => <UserRoleAssignmentForm userOptions={userOptions} roleOptions={roleOptions} />,
            finish: () => (
              <ScrollArea className="w-full flex-1 overflow-y-hidden">
                <AssignmentCategoriesReview />
                <RoleFormReview />
              </ScrollArea>
            ),
          })}
          <StepperNavigationButtons isPending={isPending} isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} />
        </form>
      </Form>
    </div>
  );
};

export default AreaFormStepper;
