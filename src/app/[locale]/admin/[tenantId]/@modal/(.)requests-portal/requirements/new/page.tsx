import { FC } from 'react';

import { RequirementForm } from '@/components/common/requirement/requirement-form';
import PageDialogWrapper from '@/components/page-dialog-wrapper';

interface NewRequirementPageProps {
  params: Promise<{ tenantId: string }>;
}

const NewRequirementPage: FC<NewRequirementPageProps> = async ({ params }) => {
  const { tenantId } = await params;

  return (
    <PageDialogWrapper title="Requirement Information" description="Please fill in the required fields to create a new requirement.">
      <RequirementForm tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default NewRequirementPage;
