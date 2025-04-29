import { FC } from 'react';

import RequirementTypeForm from '@/components/common/requirement-type/requirement-type-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewRequirementTypePageProps {
  params: Promise<{ tenantId: string }>;
}

const NewRequirementTypePage: FC<NewRequirementTypePageProps> = async ({ params }) => {
  const { tenantId } = await params;

  return (
    <PageCardWrapper title="Requirement Type Information" description="Please fill in the required fields to create a new requirement type.">
      <RequirementTypeForm tenantId={tenantId} />
    </PageCardWrapper>
  );
};

export default NewRequirementTypePage;
