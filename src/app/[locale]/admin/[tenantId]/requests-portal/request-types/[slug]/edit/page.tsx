import { FC } from 'react';
import { getFormsAsOptions } from '@/actions/form';
import { getRequestHierarchyAndLevelsByTenantId } from '@/actions/hierarchy';
import { getRequestCategoriesByIds } from '@/actions/request-type';
import { getRequirementsAsOptions } from '@/actions/requirement';

import RequestTypeForm from '@/components/common/request-type/request-type-form';
import { PageCardWrapper } from '@/components/page-card-wrapper';

interface UpdateRequestTypePageProps {
  params: Promise<{ locale: string; slug: string; tenantId: string }>;
}

const UpdateRequestTypePage: FC<UpdateRequestTypePageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;
  const forms = await getFormsAsOptions(tenantId);
  const requirements = await getRequirementsAsOptions(tenantId);
  const { hierarchy, levels } = await getRequestHierarchyAndLevelsByTenantId(locale, tenantId);
  const initialValues = await getRequestCategoriesByIds([slug], tenantId);

  return (
    <PageCardWrapper title="Update Request Type" description="Update the request type by adding or removing categories.">
      <RequestTypeForm initialValues={initialValues} hierarchyId={hierarchy.id} forms={forms} requirements={requirements} levels={levels} tenantId={tenantId} />
    </PageCardWrapper>
  );
};

export default UpdateRequestTypePage;
