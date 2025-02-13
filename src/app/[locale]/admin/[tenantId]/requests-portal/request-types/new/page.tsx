import { FC } from 'react';
import { getFormsAsOptions } from '@/actions/form';
import { getRequestHierarchyAndLevelsByTenantId } from '@/actions/hierarchy';
import { getRequirementsAsOptions } from '@/actions/requirement';

import RequestTypeForm from '@/components/common/request-type/request-type-form';
import { PageCardWrapper } from '@/components/page-card-wrapper';

interface NewPageProps {
  params: Promise<{ locale: string; tenantId: string }>;
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const forms = await getFormsAsOptions(tenantId);
  const requirements = await getRequirementsAsOptions(tenantId);
  const { hierarchy, levels } = await getRequestHierarchyAndLevelsByTenantId(locale, tenantId);

  return (
    <PageCardWrapper title="New Request Category" description="Create a new request category. A category can have multiple and recursive subcategories according to your business needs.">
      <RequestTypeForm hierarchyId={hierarchy.id} forms={forms} requirements={requirements} levels={levels} tenantId={tenantId} />
    </PageCardWrapper>
  );
};

export default NewPage;
