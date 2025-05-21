import { FC } from 'react';

import PriorityForm from '@/components/common/priority/priority-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewPriorityPageProps {
  params: Promise<{ tenantId: string }>;
}

const NewPriorityPage: FC<NewPriorityPageProps> = async ({ params }) => {
  const { tenantId } = await params;

  return (
    <PageDialogWrapper title="Priority Information" description="Please fill in the required fields to create a new priority.">
      <PriorityForm tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default NewPriorityPage;
