import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import RequirementTypeForm from '@/components/common/requirement-type/requirement-type-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewRequirementTypePageProps {
  params: Promise<{ tenantId: string }>;
}

const NewRequirementTypePage: FC<NewRequirementTypePageProps> = async ({ params }) => {
  const { tenantId } = await params;
  const t = await getTranslations('admin.requirementType.form');

  return (
    <PageCardWrapper title={t('header.title')} description={t('header.descriptionCreate')}>
      <RequirementTypeForm tenantId={tenantId} />
    </PageCardWrapper>
  );
};

export default NewRequirementTypePage;
