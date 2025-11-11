import { type Metadata } from 'next';
import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getRequirementTypeAsFormById } from '@/actions/requirementType';
import { getTranslations } from 'next-intl/server';

import RequirementTypeForm from '@/components/common/requirement-type/requirement-type-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface UpdateRequirementTypePageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

export async function generateMetadata(props: UpdateRequirementTypePageProps): Promise<Metadata> {
  const { locale, tenantId, slug } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });
  
  const requirementType = await getRequirementTypeAsFormById(tenantId, slug);
  const requirementTypeName = requirementType?.name || `Tipo de Requisito #${slug}`;

  return {
    title: `${requirementTypeName} - ${t('pages.requirementTypeEdit.title')} - ${t('brandName')}`,
    description: t('pages.requirementTypeEdit.description'),
  };
}

const UpdateRequirementTypePage: FC<UpdateRequirementTypePageProps> = async ({ params }) => {
  const { tenantId, slug, locale } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.REQUIREMENT_TYPE.EDIT]);
  
  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/requirement-types', params: { tenantId } } });
  }

  const t = await getTranslations('admin.requirementType.form');

  const requirementType = await getRequirementTypeAsFormById(slug, tenantId);

  if (!requirementType) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/requirement-types', params: { tenantId } } });
  }

  return (
    <PageCardWrapper title={t('header.title')} description={t('header.descriptionUpdate')}>
      <RequirementTypeForm tenantId={tenantId} initialValues={{ ...requirementType, id: slug }} />
    </PageCardWrapper>
  );
};

export default UpdateRequirementTypePage;
