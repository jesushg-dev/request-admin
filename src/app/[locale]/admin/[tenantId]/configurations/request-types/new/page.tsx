import { FC } from 'react';
import { getFormsAsOptions } from '@/actions/form';
import { getRequestHierarchyAndLevelsByTenantId } from '@/actions/hierarchy';
import { getRequirementsAsOptions } from '@/actions/requirement';
import { type Locale } from 'next-intl';

import RequestTypeForm from '@/components/common/request-type/request-type-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
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
