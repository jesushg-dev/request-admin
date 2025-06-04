import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import { RequirementForm } from '@/components/common/requirement/requirement-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewRequirementPageProps {
  params: Promise<{ tenantId: string }>;
}

const NewRequirementPage: FC<NewRequirementPageProps> = async ({ params }) => {
  const { tenantId } = await params;
  const t = await getTranslations('admin.requirement.form');

  return (
    <PageDialogWrapper title={t('header.title')} description={t('header.descriptionCreate')}>
      <RequirementForm tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default NewRequirementPage;
