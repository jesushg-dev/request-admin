import { type Metadata } from 'next';
import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getTranslations } from 'next-intl/server';
import { getFormsAsOptions } from '@/actions/form';
import { getRequestHierarchiesAndLevelsByTenantId } from '@/actions/hierarchy';
import { getRequestCategoriesByIds } from '@/actions/request-type';
import { getRequirementsAsOptions } from '@/actions/requirement';

import { HierarchicalResourceProvider } from '@/components/common/request-type/hierarchical-category-provider';
import RequestTypeForm from '@/components/common/request-type/request-type-form';

interface UpdateRequestTypePageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

export async function generateMetadata(props: UpdateRequestTypePageProps): Promise<Metadata> {
  const { locale, tenantId, slug } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });
  
  const requestType = await getRequestCategoriesByIds(tenantId, [slug]);
  const requestTypeName = requestType?.[0]?.name || `Tipo de Solicitud #${slug}`;

  return {
    title: `${requestTypeName} - ${t('pages.requestTypeEdit.title')} - ${t('brandName')}`,
    description: t('pages.requestTypeEdit.description'),
  };
}

const UpdateRequestTypePage: FC<UpdateRequestTypePageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.REQUEST_TYPE.EDIT]);
  
  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/request-types', params: { tenantId } } });
  }

  const forms = await getFormsAsOptions(tenantId);
  const requirements = await getRequirementsAsOptions(tenantId);
  const hierarchies = await getRequestHierarchiesAndLevelsByTenantId(locale, tenantId);
  const initialValues = await getRequestCategoriesByIds([slug], tenantId);

  if (!initialValues) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/request-types', params: { tenantId } } });
  }

  return (
    <HierarchicalResourceProvider initialCategories={initialValues.categories}>
      <RequestTypeForm initialValues={initialValues} forms={forms} requirements={requirements} requestHierarchies={hierarchies} tenantId={tenantId} />
    </HierarchicalResourceProvider>
  );
};

export default UpdateRequestTypePage;
