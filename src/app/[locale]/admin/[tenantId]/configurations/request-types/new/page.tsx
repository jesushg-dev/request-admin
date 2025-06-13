import { FC } from 'react';
import { getFormsAsOptions } from '@/actions/form';
import { getRequestHierarchiesAndLevelsByTenantId } from '@/actions/hierarchy';
import { getRequirementsAsOptions } from '@/actions/requirement';
import { type Locale } from 'next-intl';

import { HierarchicalResourceProvider } from '@/components/common/request-type/hierarchical-category-provider';
import RequestTypeForm from '@/components/common/request-type/request-type-form';

interface NewPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const forms = await getFormsAsOptions(tenantId);
  const requirements = await getRequirementsAsOptions(tenantId);
  const hierarchies = await getRequestHierarchiesAndLevelsByTenantId(locale, tenantId);

  return (
    <HierarchicalResourceProvider>
      <RequestTypeForm forms={forms} requirements={requirements} requestHierarchies={hierarchies} tenantId={tenantId} />
    </HierarchicalResourceProvider>
  );
};

export default NewPage;
