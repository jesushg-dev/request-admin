import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getTranslations } from 'next-intl/server';

import PriorityForm from '@/components/common/priority/priority-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewPriorityPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const NewPriorityPage: FC<NewPriorityPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.PRIORITY.CREATE]);
  
  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/priorities', params: { tenantId } } });
  }

  const t = await getTranslations('admin.requestPriorityType.form');

  return (
    <PageDialogWrapper title={t('header.title')} description={t('header.descriptionCreate')}>
      <PriorityForm tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default NewPriorityPage;
