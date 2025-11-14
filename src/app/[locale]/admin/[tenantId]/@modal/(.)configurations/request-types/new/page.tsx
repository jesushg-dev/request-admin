import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getTranslations } from 'next-intl/server';
import { getRequestHierarchiesAndLevelsByTenantId } from '@/actions/hierarchy';

import CreateNewRequestType from '@/components/common/request-type/create-request-type';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewRequestTypePageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const NewRequestTypePage: FC<NewRequestTypePageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.REQUEST_TYPE.CREATE]);
  
  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/request-types', params: { tenantId } } });
  }

  const hierarchies = await getRequestHierarchiesAndLevelsByTenantId(locale, tenantId);
  const t = await getTranslations('admin.requestType.create');

  if (hierarchies.length === 0) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/request-hierarchies/new', params: { tenantId } } });
  }

  return (
    <PageDialogWrapper title={t('createNewRequestType')} description={t('createNewRequestTypeDescription')}>
      <CreateNewRequestType requestHierarchies={hierarchies} />
    </PageDialogWrapper>
  );
};

export default NewRequestTypePage;

