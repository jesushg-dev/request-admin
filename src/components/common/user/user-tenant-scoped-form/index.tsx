'use client';

import { useEffect, useMemo, useTransition, type FC } from 'react';
import { upsertUser } from '@/actions/user';
import { useRouter } from '@/i18n/routing';
import {
  getAreaRoleAssignmentSchema,
  getUserRoleSchema,
  getUserSchema,
  useAreaRoleAssignmentSchema,
  useUserRoleSchema,
  useUserSchema,
  type TAreaRoleAssignmentSchema,
  type TUserRoleSchema,
  type TUserSchema,
} from '@/services/schemas/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AreaRoleOptionType } from '@/types/zenstackhq/user';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OptionType } from '@/components/custom-ui/select';
import { StepNavigationModern } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import AreaRoleAssignmentForm, { getDefaultAreaRoleAssignment } from './area-role-assignment-form';
import UserForm, { getDefaultUser } from './user-form';
import UserRoleForm, { getDefaultUserRole } from './user-role-form';
import UserTenantScopedReview from './user-tenant-scoped-review';

const { useStepper } = defineStepper(
  { id: 'user', label: 'steps.user', schema: getUserSchema() },
  { id: 'globalRole', label: 'steps.globalRole', schema: getUserRoleSchema() },
  { id: 'areaRole', label: 'steps.areaRole', schema: getAreaRoleAssignmentSchema() },
  { id: 'summary', label: 'steps.summary', schema: z.object({}) }
);

export type UserTenantScopedFormValues = TUserSchema & TAreaRoleAssignmentSchema & TUserRoleSchema;

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
  const t = useTranslations('admin.user.form');

  // Get internationalized schemas
  const userSchemaIntl = useUserSchema();
  const userRoleSchemaIntl = useUserRoleSchema();
  const areaRoleAssignmentSchemaIntl = useAreaRoleAssignmentSchema();

  // Create a map of step IDs to internationalized schemas
  const schemasMap = useMemo(
    () => ({
      user: userSchemaIntl,
      globalRole: userRoleSchemaIntl,
      areaRole: areaRoleAssignmentSchemaIntl,
      summary: z.object({}),
    }),
    [userSchemaIntl, userRoleSchemaIntl, areaRoleAssignmentSchemaIntl]
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
    defaultValues: defaultValues ?? {
      ...getDefaultUser(),
      ...getDefaultUserRole(),
      ...getDefaultAreaRoleAssignment(),
    },
  });

  // Clear errors when step changes
  useEffect(() => {
    form.clearErrors();
  }, [stepper.state.current.data.id, form]);

  const onSubmit = async () => {
    if (!stepper.state.isLast) {
      stepper.navigation.next();
      return;
    }

    startTransition(async () => {
      const data = form.getValues() as UserTenantScopedFormValues;

      const promise = upsertUser(tenantId, data);

      toast.promise(promise, {
        loading: t('messages.saving'),
        success: (response) => {
          router.push({ pathname: '/admin/[tenantId]/security/users', params: { tenantId } });
          if ('isNewUser' in response && response.isNewUser) {
            return t('messages.invitationSent', { email: response.email });
          }
          if ('username' in response && response.username) {
            return t('messages.success', { username: response.username });
          }
          return t('messages.saved', { email: response.email });
        },
        error: (error) => t('messages.error', { error: error.message }),
      });
    });
  };

  return (
    <div className="flex flex-col flex-1 p-4">
      <StepNavigationModern
        t={t as typeof t & ((key: string) => string)}
        steps={stepper.lookup.getAll().map((s) => ({ id: s.id, label: s.label }))}
        currentId={stepper.state.current.data.id}
        getIndex={(id) => stepper.lookup.getIndex(id)}
        onStepClick={(id) => stepper.navigation.goTo(id)}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between gap-4 overflow-hidden">
          <div className="flex flex-1 overflow-y-hidden">
            <ScrollArea className="w-full flex-1 overflow-y-hidden">
              {stepper.flow.switch({
                user: () => (
                  <UserForm
                    identificationTypes={identificationTypes}
                    isEditing={stepper.state.current.data.id !== 'user' ? false : undefined}
                  />
                ),
                globalRole: () => <UserRoleForm tenantId={tenantId} roleOptions={roles} />,
                areaRole: () => <AreaRoleAssignmentForm areaOptions={areas} />,
                summary: () => <UserTenantScopedReview />,
              })}
            </ScrollArea>
          </div>
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

export default UserTenantScopedForm;
