import { type Metadata } from 'next';
import { FC } from 'react';
import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

import { RequirementForm } from '@/components/common/requirement/requirement-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewRequirementPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

export async function generateMetadata(props: NewRequirementPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.requirementNew.title')} - ${t('brandName')}`,
    description: t('pages.requirementNew.description'),
  };
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
    <PageCardWrapper title={t('header.title')} description={t('header.descriptionCreate')}>
      <RequirementForm tenantId={tenantId} />
    </PageCardWrapper>
  );
};

export default NewRequirementPage;
