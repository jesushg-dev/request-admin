import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getTranslations } from 'next-intl/server';

import RequirementTypeForm from '@/components/common/requirement-type/requirement-type-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewRequirementTypePageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const NewRequirementTypePage: FC<NewRequirementTypePageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.REQUIREMENT_TYPE.CREATE]);
  
  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/requirement-types', params: { tenantId } } });
  }

  const t = await getTranslations('admin.requirementType.form');

  return (
    <PageDialogWrapper title={t('header.title')} description={t('header.descriptionCreate')}>
      <RequirementTypeForm tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default NewRequirementTypePage;
