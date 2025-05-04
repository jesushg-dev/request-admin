import { FC } from 'react';
import { getRequirementTypeAsFormById } from '@/actions/requirementType';
import { type Locale } from 'next-intl';

import RequirementTypeForm from '@/components/common/requirement-type/requirement-type-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface UpdateRequirementTypePageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const UpdateRequirementTypePage: FC<UpdateRequirementTypePageProps> = async ({ params }) => {
  const { tenantId, slug } = await params;

  const requirementType = await getRequirementTypeAsFormById(slug, tenantId);

  return (
    <PageDialogWrapper title="Requirement Type Information" description="Please fill in the required fields to update the requirement type.">
      <RequirementTypeForm tenantId={tenantId} initialValues={{ ...requirementType, id: slug }} />
    </PageDialogWrapper>
  );
};

export default UpdateRequirementTypePage;
