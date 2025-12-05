import { FC } from 'react';
import { getAuthContext } from '@/actions/authorization';
import { getRequestPriorityTypeAsFormById } from '@/actions/priority';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import PriorityForm from '@/components/common/priority/priority-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface UpdatePriorityPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const UpdatePriorityPage: FC<UpdatePriorityPageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.PRIORITY.EDIT]);

  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/priorities', params: { tenantId } } });
  }

  const t = await getTranslations('admin.requestPriorityType.form');

  const priority = await getRequestPriorityTypeAsFormById(slug, tenantId);

  if (!priority) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/priorities', params: { tenantId } } });
  }

  return (
    <PageDialogWrapper title={t('header.title')} description={t('header.descriptionUpdate')}>
      <PriorityForm tenantId={tenantId} initialValues={{ ...priority, id: slug }} />
    </PageDialogWrapper>
  );
};

export default UpdatePriorityPage;
