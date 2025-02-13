'use client';

import { useState, useTransition, type FC } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertRole } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ModuleWithFeaturesType } from '@/types/prisma/module';
import { RequirementOptionType } from '@/types/prisma/requirement';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserRoleAssignmentForm, { userRoleFormSchema } from '@/components/common/role/user-role-assignment-form';
import { OptionType } from '@/components/select/select';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import RoleForm, { getDefaultRole, rolesFormSchema } from './role-form';
import RoleFormReview from './role-form-review';

const { useStepper, utils } = defineStepper(
  { id: 'role', label: 'Role', schema: rolesFormSchema },
  { id: 'user', label: 'User', schema: userRoleFormSchema },
  { id: 'finish', label: 'Finish', schema: z.object({}) }
);

export type RoleFormStepperType = z.infer<typeof rolesFormSchema> & z.infer<typeof userRoleFormSchema>;

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
        loading: 'Saving roles...',
        success: (responses) => {
          const names = responses.map((r) => r?.name).join(', ');
          router.push({ pathname: '/admin/[tenantId]/security/roles', params: { tenantId } });
          return `Role(s) "${names}" saved successfully.`;
        },
        error: (error) => {
          return `Failed to save roles: ${error.message}`;
        },
      });
    });
  };

  return (
    <div className="flex flex-col flex-1 p-4">
      <Card className="w-full flex flex-col flex-1 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden items-end p-6">
            <StepNavigation steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />
            {error && <PrismaErrorAlert error={error} />}
            <div className="flex flex-1 overflow-y-hidden w-full">
              <ScrollArea className="w-full flex-1 overflow-y-hidden">
                {stepper.switch({
                  role: () => <RoleForm moduleWithFeatures={moduleWithFeatures} />,
                  user: () => <UserRoleAssignmentForm userOptions={userOptions} roleOptions={roles} />,
                  finish: () => <RoleFormReview />,
                })}
              </ScrollArea>
            </div>
            <StepperNavigationButtons
              isPending={isPending}
              isFirstStep={stepper.isFirst}
              isLastStep={stepper.isLast}
              onPrev={stepper.prev}
              onReset={stepper.reset}
              nextText="Next"
              submitText="Finish"
            />
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default RoleFormStepper;
