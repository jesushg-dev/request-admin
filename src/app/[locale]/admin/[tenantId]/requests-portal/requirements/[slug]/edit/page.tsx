import { FC } from 'react';
import { getRequirementAsFormById } from '@/actions/requirement';
import { type Locale } from 'next-intl';

import { RequirementForm } from '@/components/common/requirement/requirement-form';
import { PageCardWrapper } from '@/components/page-card-wrapper';

interface UpdateRequirementPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const UpdateRequirementPage: FC<UpdateRequirementPageProps> = async ({ params }) => {
  const { tenantId, slug } = await params;

  const requirement = await getRequirementAsFormById(slug, tenantId);

  return (
    <PageCardWrapper title="Requirement Information" description="Please fill in the required fields to update the requirement.">
      <RequirementForm tenantId={tenantId} initialValues={{ ...requirement, id: slug }} />
    </PageCardWrapper>
  );
};

export default UpdateRequirementPage;
