import { FC } from 'react';
import { getRequirementAsFormById } from '@/actions/requirement';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { RequirementForm } from '@/components/common/requirement/requirement-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface UpdateRequirementPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const UpdateRequirementPage: FC<UpdateRequirementPageProps> = async ({ params }) => {
  const { tenantId, slug } = await params;
  const t = await getTranslations('admin.requirement.form');

  const requirement = await getRequirementAsFormById(slug, tenantId);

  return (
    <PageDialogWrapper title={t('header.title')} description={t('header.descriptionUpdate')}>
      <RequirementForm tenantId={tenantId} initialValues={{ ...requirement, id: slug }} />
    </PageDialogWrapper>
  );
};

export default UpdateRequirementPage;
