import { FC } from 'react';

import PriorityForm from '@/components/common/priority/priority-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewPriorityPageProps {
  params: Promise<{ tenantId: string }>;
}

const NewPriorityPage: FC<NewPriorityPageProps> = async ({ params }) => {
  const { tenantId } = await params;

  return (
    <PageCardWrapper title="Priority Information" description="Please fill in the required fields to create a new priority.">
      <PriorityForm tenantId={tenantId} />
    </PageCardWrapper>
  );
};

export default NewPriorityPage;
