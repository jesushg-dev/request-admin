import { FC } from 'react';
import { getRequirementTypeAsFormById } from '@/actions/requirementType';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import RequirementTypeForm from '@/components/common/requirement-type/requirement-type-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface UpdateRequirementTypePageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const UpdateRequirementTypePage: FC<UpdateRequirementTypePageProps> = async ({ params }) => {
  const { tenantId, slug } = await params;
  const t = await getTranslations('admin.requirementType.form');

  const requirementType = await getRequirementTypeAsFormById(slug, tenantId);

  return (
    <PageCardWrapper title={t('header.title')} description={t('header.descriptionUpdate')}>
      <RequirementTypeForm tenantId={tenantId} initialValues={{ ...requirementType, id: slug }} />
    </PageCardWrapper>
  );
};

export default UpdateRequirementTypePage;
