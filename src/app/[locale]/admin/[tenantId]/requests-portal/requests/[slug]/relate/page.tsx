import { FC } from 'react';

import { RelatedIncidentForm } from '@/components/common/request/detail/related-form';
import { PageCardWrapper } from '@/components/page-card-wrapper';

interface RelateRequestPageProps {
  params: Promise<{ tenantId: string; slug: string }>;
}

const RelateRequestPage: FC<RelateRequestPageProps> = async ({ params }) => {
  const { tenantId, slug } = await params;

  return (
    <PageCardWrapper title="Relate Request" description="Please fill in the required fields to relate a request to another incident.">
      <RelatedIncidentForm tenantId={tenantId} requestId={slug} />
    </PageCardWrapper>
  );
};

export default RelateRequestPage;
