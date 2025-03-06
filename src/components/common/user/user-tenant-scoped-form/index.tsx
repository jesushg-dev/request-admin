'use client';

import { useTransition, type FC } from 'react';
import { upsertUser } from '@/actions/user';
import { useRouter } from '@/i18n/routing';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AreaRoleOptionType } from '@/types/prisma/user';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OptionType } from '@/components/custom-ui/select';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import AreaRoleAssignmentForm, { areaRoleAssignmentFormSchema, AreaRoleAssignmentFormValues, getDefaultAreaRoleAssignment } from './area-role-assignment-form';
import UserForm, { getDefaultUser, userFormSchema, UserFormValues } from './user-form';
import UserRoleForm, { getDefaultUserRole, userRoleFormSchema, UserRoleFormValues } from './user-role-form';
import UserTenantScopedReview from './user-tenant-scoped-review';

const { useStepper, utils } = defineStepper(
  { id: 'user', label: 'User Details', schema: userFormSchema },
  { id: 'globalRole', label: 'Global Role Assignment', schema: userRoleFormSchema },
  { id: 'areaRole', label: 'Area Role Assignment', schema: areaRoleAssignmentFormSchema },
  { id: 'summary', label: 'Summary', schema: z.object({}) }
);

export type UserTenantScopedFormValues = UserFormValues & AreaRoleAssignmentFormValues & UserRoleFormValues;

interface OptionTypeWithRegex extends OptionType {
  regex: string | null;
}

interface UserTenantScopedFormProps {
  tenantId: string;
  roles: OptionType[];
  areas: AreaRoleOptionType[];
  identificationTypes: OptionTypeWithRegex[];
  defaultValues?: UserTenantScopedFormValues;
}

const UserTenantScopedForm: FC<UserTenantScopedFormProps> = ({ defaultValues, tenantId, identificationTypes, roles, areas }) => {
  const router = useRouter();
  const stepper = useStepper();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
    defaultValues: defaultValues ?? {
      ...getDefaultUser(),
      ...getDefaultUserRole(),
      ...getDefaultAreaRoleAssignment(),
    },
  });

  const onSubmit = async () => {
    if (!stepper.isLast) {
      stepper.next();
      return;
    }

    startTransition(async () => {
      const data = form.getValues() as UserTenantScopedFormValues;

      const promise = upsertUser(tenantId, data);

      toast.promise(promise, {
        loading: 'Saving user...',
        success: (response) => {
          router.push({ pathname: '/admin/[tenantId]/security/users', params: { tenantId } });
          return `User saved successfully: ${response.username}`;
        },
        error: (error) => {
          return `Failed to save user: ${error.message}`;
        },
      });
    });
  };

  return (
    <div className="flex flex-col flex-1 p-4">
      <Card className="w-full flex flex-col flex-1 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden p-6">
            <StepNavigation steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />
            <div className="flex flex-1 overflow-y-hidden">
              <ScrollArea className="w-full flex-1 overflow-y-hidden">
                {stepper.switch({
                  user: () => <UserForm identificationTypes={identificationTypes} />,
                  globalRole: () => <UserRoleForm tenantId={tenantId} roleOptions={roles} />,
                  areaRole: () => <AreaRoleAssignmentForm areaOptions={areas} />,
                  summary: () => <UserTenantScopedReview />,
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

export default UserTenantScopedForm;
