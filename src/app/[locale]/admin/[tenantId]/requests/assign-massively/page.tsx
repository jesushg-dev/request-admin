import { FC } from 'react';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import AssignRequestsForm from '@/components/common/request/assign-requests-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface AssignMassivelyRequestsPageProps {
  params: Promise<{ tenantId: string; locale: Locale }>;
}

const AssignMassivelyRequestsPage: FC<AssignMassivelyRequestsPageProps> = async ({ params }) => {
  const { tenantId, locale } = await params;
  const t = await getTranslations('admin.request.massiveAssign');

  const auth = await getAuthContext(tenantId);
  const canAssign = auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.ASSIGN_USER]);
  if (!canAssign) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/requests', params: { tenantId } } });
  }

  return (
    <PageCardWrapper title={t('title')} description={t('description')}>
      <AssignRequestsForm />
    </PageCardWrapper>
  );
};

export default AssignMassivelyRequestsPage;
