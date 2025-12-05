import { FC } from 'react';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { RequirementForm } from '@/components/common/requirement/requirement-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewRequirementPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const NewRequirementPage: FC<NewRequirementPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.REQUIREMENT.CREATE]);

  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/requirements', params: { tenantId } } });
  }

  const t = await getTranslations('admin.requirement.form');

  return (
    <PageDialogWrapper title={t('header.title')} description={t('header.descriptionCreate')}>
      <RequirementForm tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default NewRequirementPage;
