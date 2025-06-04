'use client';

import { useState, useTransition, type FC } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertRole } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ModuleWithFeaturesType } from '@/types/prisma/module';
import { RequirementOptionType } from '@/types/prisma/requirement';
import { Form } from '@/components/ui/form';
import UserRoleAssignmentForm, { userRoleAssignmentFormSchema } from '@/components/common/role/user-role-assignment-form';
import { OptionType } from '@/components/custom-ui/select';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';
import { StepNavigationModern } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import RoleForm, { getDefaultRole, rolesFormSchema } from './role-form';
import RoleFormReview from './role-form-review';

const { useStepper, utils } = defineStepper(
  { id: 'role', label: 'steps.role', schema: rolesFormSchema },
  { id: 'user', label: 'steps.user', schema: userRoleAssignmentFormSchema },
  { id: 'finish', label: 'steps.finish', schema: z.object({}) }
);

export type RoleFormStepperType = z.infer<typeof rolesFormSchema> & z.infer<typeof userRoleAssignmentFormSchema>;

interface RoleFormStepperProps {
  tenantId: string;
  userOptions: OptionType[];
  requirements: RequirementOptionType[];
  moduleWithFeatures: ModuleWithFeaturesType[];
  initialValues?: RoleFormStepperType | null;
}

const RoleFormStepper: FC<RoleFormStepperProps> = ({ tenantId, userOptions, moduleWithFeatures, initialValues }) => {
  const router = useRouter();
  const stepper = useStepper();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertRole();
  const t = useTranslations('component.rolesForm');

  const [roles, setRoles] = useState<OptionType[]>([]);

  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
    defaultValues: stepper.current.id === 'role' ? { roles: initialValues?.roles ?? [getDefaultRole()], userRoles: initialValues?.userRoles ?? [] } : {},
  });

  const onSubmit = async (values: z.infer<typeof stepper.current.schema>) => {
    if (stepper.current.id === 'role' && 'roles' in values) {
      const rolesOptions = values.roles.map((role) => ({ value: role.id, label: role.name }));
      setRoles(rolesOptions);
    }

    if (!stepper.isLast) {
      stepper.next();
      return;
    }

    startTransition(async () => {
      const data = form.getValues() as RoleFormStepperType;

      const promises = Promise.all(
        data.roles.map((role) => {
          const userRole = data.userRoles.filter((item) => item.roleId.value === role.id);

          return upsert({
            update: {
              tenantId,
              name: role.name,
              description: role.description,
              isActive: role.isActive,
              userRole: {
                deleteMany: { tenantId, roleId: role.id },
                create: userRole.map((item) => ({ tenantId, id: item.id, isActive: item.isActive, userTenantId: item.userId.value })),
              },
              roleFeature: {
                deleteMany: { tenantId, roleId: role.id },
                create: role.features.map((feature) => ({ tenantId, id: feature.id, isActive: feature.isActive, featureId: feature.featureId })),
              },
            },
            create: {
              tenantId,
              name: role.name,
              description: role.description,
              isActive: role.isActive,
              userRole: {
                create: userRole.map((item) => ({ tenantId, isActive: item.isActive, userTenantId: item.userId.value })),
              },
              roleFeature: {
                create: role.features.map((feature) => ({ tenantId, isActive: feature.isActive, featureId: feature.featureId })),
              },
            },
            where: { tenantId, id: role.id },
          });
        })
      );

      toast.promise(promises, {
        loading: t('messages.saving'),
        success: (responses) => {
          const names = responses.map((r) => r?.name).join(', ');
          router.push({ pathname: '/admin/[tenantId]/security/roles', params: { tenantId } });
          return t('messages.success', { names, count: responses.length });
        },
        error: (error) => t('messages.error', { error: error.message }),
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
            role: () => <RoleForm moduleWithFeatures={moduleWithFeatures} />,
            user: () => <UserRoleAssignmentForm userOptions={userOptions} roleOptions={roles} />,
            finish: () => <RoleFormReview />,
          })}
          <StepperNavigationButtons isPending={isPending} isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} />
        </form>
      </Form>
    </div>
  );
};

export default RoleFormStepper;
