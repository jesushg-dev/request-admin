import { FC } from 'react';
import { type Metadata } from 'next';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import RequirementTypeForm from '@/components/common/requirement-type/requirement-type-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewRequirementTypePageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

export async function generateMetadata(props: NewRequirementTypePageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.requirementTypeNew.title')} - ${t('brandName')}`,
    description: t('pages.requirementTypeNew.description'),
  };
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
    <PageCardWrapper title={t('header.title')} description={t('header.descriptionCreate')}>
      <RequirementTypeForm tenantId={tenantId} />
    </PageCardWrapper>
  );
};

export default NewRequirementTypePage;
