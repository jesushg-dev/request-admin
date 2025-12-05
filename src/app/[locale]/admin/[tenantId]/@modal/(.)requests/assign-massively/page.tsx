import { FC } from 'react';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import AssignRequestsForm from '@/components/common/request/assign-requests-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface AssignMassivelyRequestsPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const AssignMassivelyRequestsPage: FC<AssignMassivelyRequestsPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canAssign = auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.ASSIGN_USER]);

  if (!canAssign) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/requests', params: { tenantId } } });
  }

  const t = await getTranslations('admin.request.massiveAssign');

  return (
    <PageDialogWrapper title={t('title')} description={t('description')}>
      <AssignRequestsForm />
    </PageDialogWrapper>
  );
};

export default AssignMassivelyRequestsPage;
