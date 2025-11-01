import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getRequirementAsFormById } from '@/actions/requirement';
import { getTranslations } from 'next-intl/server';

import { RequirementForm } from '@/components/common/requirement/requirement-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface UpdateRequirementPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const UpdateRequirementPage: FC<UpdateRequirementPageProps> = async ({ params }) => {
  const { tenantId, slug, locale } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.REQUIREMENT.EDIT]);
  
  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/requirements', params: { tenantId } } });
  }

  const t = await getTranslations('admin.requirement.form');

  const requirement = await getRequirementAsFormById(slug, tenantId);

  if (!requirement) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/requirements', params: { tenantId } } });
  }

  return (
    <PageCardWrapper title={t('header.title')} description={t('header.descriptionUpdate')}>
      <RequirementForm tenantId={tenantId} initialValues={{ ...requirement, id: slug }} />
    </PageCardWrapper>
  );
};

export default UpdateRequirementPage;
