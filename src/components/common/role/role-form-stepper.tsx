'use client';

import { useEffect, useMemo, useState, useTransition, type FC } from 'react';
import { CreateRole, UpdateRole } from '@/actions/role';
import { useRouter } from '@/i18n/routing';
import { getRolesSchema, getUserRoleAssignmentSchema, useRolesSchema, useUserRoleAssignmentSchema, type TRolesSchema, type TUserRoleAssignmentSchema } from '@/services/schemas/role';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ModuleWithFeaturesType } from '@/types/zenstackhq/module';
import { RequirementOptionType } from '@/types/zenstackhq/requirement';
import { Form } from '@/components/ui/form';
import UserRoleAssignmentForm from '@/components/common/role/user-role-assignment-form';
import { OptionType } from '@/components/custom-ui/select';
import { StepNavigationModern } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import RoleForm, { getDefaultRole } from './role-form';
import RoleFormReview from './role-form-review';

const { useStepper } = defineStepper(
  { id: 'role', label: 'steps.role', schema: getRolesSchema() },
  { id: 'user', label: 'steps.user', schema: getUserRoleAssignmentSchema() },
  { id: 'finish', label: 'steps.finish', schema: z.object({}) }
);

export type RoleFormStepperType = TRolesSchema & TUserRoleAssignmentSchema;

interface RoleFormStepperProps {
  tenantId: string;
  userOptions: OptionType[];
  requirements: RequirementOptionType[];
  moduleWithFeatures: ModuleWithFeaturesType[];
  initialValues?: RoleFormStepperType | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const RoleFormStepper: FC<RoleFormStepperProps> = ({ tenantId, userOptions, moduleWithFeatures, initialValues }) => {
  const router = useRouter();
  const stepper = useStepper();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('component.rolesForm');

  const [roles, setRoles] = useState<OptionType[]>([]);

  // Get internationalized schemas
  const rolesSchemaIntl = useRolesSchema();
  const userRoleAssignmentSchemaIntl = useUserRoleAssignmentSchema();

  // Create a map of step IDs to internationalized schemas
  const schemasMap = useMemo(
    () => ({
      role: rolesSchemaIntl,
      user: userRoleAssignmentSchemaIntl,
      finish: z.object({}),
    }),
    [rolesSchemaIntl, userRoleAssignmentSchemaIntl]
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

  const form = useForm({
    mode: 'onTouched',
    resolver: dynamicResolver,
    defaultValues: stepper.state.current.data.id === 'role' ? { roles: initialValues?.roles ?? [getDefaultRole()], userRoles: initialValues?.userRoles ?? [] } : {},
  });

  // Clear errors when step changes
  useEffect(() => {
    form.clearErrors();
  }, [stepper.state.current.data.id, form]);

  const currentStepData = stepper.state.current.data;
  const onSubmit = async (values: unknown) => {
    if (currentStepData.id === 'role' && isRecord(values)) {
      const rolesOptions = ((values.roles as TRolesSchema['roles'] | undefined) ?? []).map((role) => ({
        value: role.id,
        label: role.name,
      }));
      setRoles(rolesOptions);
    }

    if (!stepper.state.isLast) {
      stepper.navigation.next();
      return;
    }

    startTransition(async () => {
      try {
        const data = form.getValues() as RoleFormStepperType;

        let result;

        if (initialValues) {
          // Update existing roles
          result = await UpdateRole(data, tenantId);
        } else {
          // Create new roles
          result = await CreateRole(data, tenantId);
        }

        const names = result.map((r) => r?.name).join(', ');
        toast.success(t('messages.success', { names, count: result.length }));
        router.push({ pathname: '/admin/[tenantId]/security/roles', params: { tenantId } });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        toast.error(t('messages.error', { error: errorMessage }));
      }
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
          {stepper.flow.switch({
            role: () => <RoleForm moduleWithFeatures={moduleWithFeatures} />,
            user: () => <UserRoleAssignmentForm userOptions={userOptions} roleOptions={roles} />,
            finish: () => <RoleFormReview />,
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

export default RoleFormStepper;
