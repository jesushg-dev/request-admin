import { FC } from 'react';
import { getFormsAsOptions } from '@/actions/form';
import { getRequestHierarchiesAndLevelsByTenantId } from '@/actions/hierarchy';
import { getRequestCategoriesByIds } from '@/actions/request-type';
import { getRequirementsAsOptions } from '@/actions/requirement';
import { type Locale } from 'next-intl';

import { HierarchicalResourceProvider } from '@/components/common/request-type/hierarchical-category-provider';
import RequestTypeForm from '@/components/common/request-type/request-type-form';

interface UpdateRequestTypePageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const UpdateRequestTypePage: FC<UpdateRequestTypePageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;
  const forms = await getFormsAsOptions(tenantId);
  const requirements = await getRequirementsAsOptions(tenantId);
  const hierarchies = await getRequestHierarchiesAndLevelsByTenantId(locale, tenantId);
  const initialValues = await getRequestCategoriesByIds([slug], tenantId);

  return (
    <HierarchicalResourceProvider initialCategories={initialValues.categories}>
      <RequestTypeForm initialValues={initialValues} forms={forms} requirements={requirements} requestHierarchies={hierarchies} tenantId={tenantId} />
    </HierarchicalResourceProvider>
  );
};

export default UpdateRequestTypePage;
