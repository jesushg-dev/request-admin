'use client';

import React, { useEffect, useMemo, useState, useTransition, type FC } from 'react';
import { upsertCategoriesFlat } from '@/actions/assignment-type';
import { useRouter } from '@/i18n/routing';
import { useUpsertArea } from '@/services/api/hooks';
import { getAreaSchema, useAreaSchema, type TAreaSchema } from '@/services/schemas/area';
import { getCategoriesSchema, useCategoriesSchema, type TCategoriesSchema } from '@/services/schemas/category';
import { getRolesSchema, getUserRoleAssignmentSchema, useRolesSchema, useUserRoleAssignmentSchema, type TRolesSchema, type TUserRoleAssignmentSchema } from '@/services/schemas/role';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AssignmentHierarchyWithLevelsType } from '@/types/zenstackhq/hierarchy';
import { ModuleWithFeaturesType } from '@/types/zenstackhq/module';
import { RequirementOptionType } from '@/types/zenstackhq/requirement';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import AreaForm, { getAreaDefaultValue } from '@/components/common/area/area-form';
import AssignmentCategoryForm from '@/components/common/category/assignment-category-form';
import RolesForm from '@/components/common/role/role-form';
import UserRoleAssignmentForm from '@/components/common/role/user-role-assignment-form';
import { OptionType } from '@/components/custom-ui/select';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';
import { StepNavigationModern } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import AssignmentCategoriesReview from '../category/assignment-categories-review';
import RoleFormReview from '../role/role-form-review';

// Stepper definition
const { useStepper } = defineStepper(
  { id: 'description', label: 'steps.description', schema: getAreaSchema() },
  { id: 'assignmentCategory', label: 'steps.assignmentCategory', schema: getCategoriesSchema() },
  { id: 'role', label: 'steps.role', schema: getRolesSchema() },
  { id: 'user', label: 'steps.user', schema: getUserRoleAssignmentSchema() },
  { id: 'finish', label: 'steps.finish', schema: z.object({}) }
);

export type AreaFormStepperType = TAreaSchema & TCategoriesSchema & TRolesSchema & TUserRoleAssignmentSchema;

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

  // Get internationalized schemas
  const areaSchemaIntl = useAreaSchema();
  const categoriesSchemaIntl = useCategoriesSchema();
  const rolesSchemaIntl = useRolesSchema();
  const userRoleAssignmentSchemaIntl = useUserRoleAssignmentSchema();

  // Create a map of step IDs to internationalized schemas
  const schemasMap = useMemo(
    () => ({
      description: areaSchemaIntl,
      assignmentCategory: categoriesSchemaIntl,
      role: rolesSchemaIntl,
      user: userRoleAssignmentSchemaIntl,
      finish: z.object({}),
    }),
    [areaSchemaIntl, categoriesSchemaIntl, rolesSchemaIntl, userRoleAssignmentSchemaIntl]
  );

  // Create a custom resolver that dynamically selects the correct internationalized schema
  const dynamicResolver = useMemo(() => {
    return (values: any, context: any, options: any) => {
      const currentData = stepper.state.current.data;
      const currentSchema = schemasMap[currentData.id as keyof typeof schemasMap] || (currentData as { schema?: z.ZodType }).schema;
      const resolver = zodResolver(currentSchema ?? z.object({}));
      return resolver(values, context, options);
    };
  }, [stepper.state.current.data.id, schemasMap, stepper]);

  // Initialize React Hook Form with current step schema
  const form = useForm({
    mode: 'onTouched',
    resolver: dynamicResolver,
    defaultValues: defaultValues ? defaultValues : stepper.state.current.data.id === 'description' ? getAreaDefaultValue() : {},
  });

  // Clear errors when step changes
  useEffect(() => {
    form.clearErrors();
  }, [stepper.state.current.data.id, form]);

  const [roleOptions, setRoleOptions] = useState<OptionType[]>([]);

  const currentStepData = stepper.state.current.data;
  // Handle form submission
  const onSubmit = (values: unknown) => {
    if (currentStepData.id === 'description' && 'hierarchyId' in values) {
      const hierarchy = assignmentHierarchies.find((h) => h.id === values.hierarchyId.value);
      if (!hierarchy) {
        form.setError('root.description.hierarchyId', { message: 'Invalid hierarchy' });
        return;
      }
      setSelectedHierarchy(hierarchy);
    }

    if (currentStepData.id === 'role' && 'roles' in values) {
      const roles = values.roles.map((role) => ({ value: role.id, label: role.name }));
      setRoleOptions(roles);
    }

    if (!stepper.state.isLast) {
      stepper.navigation.next();
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
      <StepNavigationModern
        t={t as typeof t & ((key: string) => string)}
        steps={stepper.lookup.getAll().map((s) => ({ id: s.id, label: s.label }))}
        currentId={currentStepData.id}
        getIndex={(id) => stepper.lookup.getIndex(id)}
        onStepClick={(id) => stepper.navigation.goTo(id)}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between gap-4 overflow-hidden">
          {error && <PrismaErrorAlert error={error} />}
          {stepper.flow.switch({
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
          <StepperNavigationButtons
            isPending={isPending}
            isFirstStep={stepper.state.isFirst}
            isLastStep={stepper.state.isLast}
            onPrev={stepper.navigation.prev}
            onReset={stepper.navigation.reset}
          />
        </form>
      </Form>
    </div>
  );
};

export default AreaFormStepper;
