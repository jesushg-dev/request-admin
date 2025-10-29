import React, { FC } from 'react';
import { type Locale } from 'next-intl';
import { getPrioritiesAsOptions } from '@/actions/request';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';

import RequestFormStepper from '@/components/common/request/request-form-stepper';

interface NewPageProps {
    params: Promise<{ locale: Locale, tenantId: string }>;
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.CREATE]);
  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/requests', params: { tenantId } } });
  }

  const priorities = await getPrioritiesAsOptions(tenantId);

  return <RequestFormStepper tenantId={tenantId} prioritiesOptions={priorities} />;
};

export default NewPage;
