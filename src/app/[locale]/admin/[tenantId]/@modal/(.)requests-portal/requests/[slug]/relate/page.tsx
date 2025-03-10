import { FC } from 'react';

import { RelatedIncidentForm } from '@/components/common/request/detail/related-form';
import PageDialogWrapper from '@/components/page-dialog-wrapper';

interface RelateRequestPageProps {
  params: Promise<{ tenantId: string; slug: string }>;
}

const RelateRequestPage: FC<RelateRequestPageProps> = async ({ params }) => {
  const { tenantId, slug } = await params;

  return (
    <PageDialogWrapper title="Relate Request" description="Please fill in the required fields to relate a request to another incident.">
      <RelatedIncidentForm tenantId={tenantId} requestId={slug} />
    </PageDialogWrapper>
  );
};

export default RelateRequestPage;
