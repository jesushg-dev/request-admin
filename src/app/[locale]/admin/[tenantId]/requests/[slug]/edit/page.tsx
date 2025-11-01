import React, { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getPrioritiesAsOptions, getRequestById } from '@/actions/request';

import RequestFormStepper from '@/components/common/request/request-form-stepper';

interface EditPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

const EditPage: FC<EditPageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEditGlobal = auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.EDIT]);
  
  // First get the request to check area permissions
  const defaultValues = await getRequestById(tenantId, slug);
  
  if (!defaultValues) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/requests', params: { tenantId } } });
  }

  // Check if user has scoped edit permission for this request's area
  const canEditScoped = auth.hasAreaPermissions(defaultValues.areaId.value, [
    PermissionActions.REQUEST_MANAGEMENT.SCOPED_EDIT,
  ]);

  if (!canEditGlobal && !canEditScoped) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/requests/[slug]', params: { tenantId, slug } } });
  }

  const priorities = await getPrioritiesAsOptions(tenantId);

  return <RequestFormStepper tenantId={tenantId} defaultValues={defaultValues} prioritiesOptions={priorities} />;
};

export default EditPage;
