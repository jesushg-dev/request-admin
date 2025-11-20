import { type Metadata } from 'next';
import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getTranslations } from 'next-intl/server';
import { getFormsAsOptions } from '@/actions/form';
import { getRequestHierarchyById } from '@/actions/hierarchy';
import { getRequestCategoriesByIds } from '@/actions/request-type';
import { getRequirementsAsOptions } from '@/actions/requirement';

import RequestTypeForm from '@/components/common/request-type/request-type-form';

interface UpdateRequestTypePageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

export async function generateMetadata(props: UpdateRequestTypePageProps): Promise<Metadata> {
  const { locale, tenantId, slug } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });
  
  const requestType = await getRequestCategoriesByIds([slug], tenantId);
  const requestTypeName = requestType?.categories?.[0]?.name || `Tipo de Solicitud #${slug}`;

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
  const initialValues = await getRequestCategoriesByIds([slug], tenantId);

  if (!initialValues || initialValues.categories.length === 0) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/request-types', params: { tenantId } } });
  }

  const hierarchy = await getRequestHierarchyById(String(initialValues.hierarchyId.value), tenantId);

  if (!hierarchy) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/request-types', params: { tenantId } } });
  }

  return (
    <RequestTypeForm
      initialValues={initialValues}
      forms={forms}
      requirements={requirements}
      requestHierarchy={hierarchy}
      tenantId={tenantId}
    />
  );
};

export default UpdateRequestTypePage;
