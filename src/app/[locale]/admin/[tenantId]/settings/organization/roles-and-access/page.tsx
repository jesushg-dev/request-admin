'use client';

import { useTransition } from 'react';
import { getRoles } from '@/constants/system-role';
import { authClient } from '@/server/auth-client';
import { useUpdateUserTenant } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, LogOut, ShieldCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import useMessage from '@/lib/message';
import { PERMISSION, useAuthorization } from '@/hooks/use-authorization';
import useTenantId from '@/hooks/use-tenant-id';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { AlertBanner } from '@/components/custom-ui/alert-banner';
import Select, { optionSchema } from '@/components/custom-ui/select';

const userTenantFormSchema = z.object({
  isActive: z.boolean(),
  isTermAccepted: z.boolean(),
  role: z.array(optionSchema),
});

const defaultValues: Partial<UserTenantFormValues> = {
  isActive: true,
  isTermAccepted: false,
  role: [],
};

type UserTenantFormValues = z.infer<typeof userTenantFormSchema>;

export default function UserTenantForm() {
  const t = useTranslations('admin.setting.roleAndAccess');
  const locale = useLocale();
  const roles = getRoles(locale);
  const organizationId = useTenantId();
  const { mutateAsync: update } = useUpdateUserTenant();
  const { session, userTenant, hasPermission } = useAuthorization(organizationId);

  const message = useMessage();
  const [isUpdating, startUpdating] = useTransition();
  const [isLeavingOrg, startLeavingOrg] = useTransition();

  const form = useForm<UserTenantFormValues>({
    resolver: zodResolver(userTenantFormSchema),
    defaultValues: userTenant ? { ...userTenant, role: [] } : defaultValues,
    mode: 'onChange',
  });

  function onSubmit(data: UserTenantFormValues) {
    const { isActive, isTermAccepted, role } = data;
    const selectedRoles = role.map((r) => r.value);

    startUpdating(async () => {
      if (!session.data?.user.id || !organizationId) return;

      const toastId = toast.loading(t('toast.updating'));
      await update(
        {
          data: { isActive, isTermAccepted, role: selectedRoles.join(',') },
          where: { userId_tenantId: { userId: session.data?.user.id, tenantId: organizationId } },
        },
        {
          onError(error) {
            toast.error(t('toast.updateError', { error: error.message }), { id: toastId });
          },
          onSuccess() {
            toast.success(t('toast.updateSuccess'), { id: toastId });
          },
        }
      );
    });
  }

  const onLeaveOrganization = async () => {
    const confirmLeave = await message.confirm(t('leaveConfirmation.message'), {
      title: t('leaveConfirmation.title'),
      confirmText: t('leaveConfirmation.confirm'),
      cancelText: t('leaveConfirmation.cancel'),
    });

    if (!confirmLeave) return;
    startLeavingOrg(async () => {
      const toastId = toast.loading(t('toast.leaving'));
      await authClient.organization.leave(
        { organizationId },
        {
          onError({ error }) {
            toast.error(t('toast.leaveError', { error: error.message }), { id: toastId });
          },
          onSuccess() {
            toast.success(t('toast.leaveSuccess'), { id: toastId });
          },
        }
      );
    });
  };

  return (
    <div className="space-y-6">
      {hasPermission(PERMISSION.ROLE_MANAGEMENT.ASSIGN) && (
        <Card>
          <CardHeader>
            <CardTitle>{t('rolesAndAccess.title')}</CardTitle>
            <CardDescription>{t('rolesAndAccess.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">{t('accountStatus.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('accountStatus.description')}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">{t('activeAccount.label')}</FormLabel>
                          <FormDescription>{t('activeAccount.description')}</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isTermAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">{t('termsAccepted.label')}</FormLabel>
                          <FormDescription>{t('termsAccepted.description')}</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-medium">{t('rolePermissions.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('rolePermissions.description')}</p>
                </div>

                <Alert variant="default" className="mb-6">
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>{t('superAdminAlert.title')}</AlertTitle>
                  <AlertDescription>{t('superAdminAlert.description')}</AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('role.label')}</FormLabel>
                      <Select isSearchable isMulti isClearable options={roles} onChange={field.onChange} value={field.value} />
                      <FormDescription>{t('role.description')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-6" />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? t('savingButton') : t('saveButton')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{t('leaveOrganization.title')}</CardTitle>
          <CardDescription>{t('leaveOrganization.description')}</CardDescription>
        </CardHeader>

        <CardContent>
          <AlertBanner
            className="mb-4"
            title={t('leaveOrganization.alert.title')}
            variant="error"
            icon={<AlertCircle className="h-4 w-4 text-red-600" />}
            description={
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>{t('leaveOrganization.alert.point1')}</li>
                <li>
                  {t.rich('leaveOrganization.alert.point2', {
                    strong: (chunks) => <span className="font-semibold">{chunks}</span>,
                  })}
                </li>
                <li>{t('leaveOrganization.alert.point3')}</li>
                <li>{t('leaveOrganization.alert.point4')}</li>
                <li>{t('leaveOrganization.alert.point5')}</li>
              </ul>
            }
          />
        </CardContent>
        <CardFooter>
          <Button variant="destructive" disabled={isLeavingOrg} className="w-full" onClick={onLeaveOrganization}>
            <LogOut className="h-4 w-4 mr-2" />
            {isLeavingOrg ? t('leaveOrganization.leavingButton') : t('leaveOrganization.button')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
