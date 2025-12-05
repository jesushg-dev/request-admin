import React, { FC } from 'react';
import { type Metadata } from 'next';
import { getAuthContext } from '@/actions/authorization';
import { getPrioritiesAsOptions, getRequestById } from '@/actions/request';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import RequestFormStepper from '@/components/common/request/request-form-stepper';

interface EditPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

export async function generateMetadata(props: EditPageProps): Promise<Metadata> {
  const { locale, tenantId, slug } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  const request = await getRequestById(tenantId, slug);
  const requestTitle = request?.issueSubject || `#${slug}`;

  return {
    title: `${requestTitle} - ${t('pages.requestEdit.title')} - ${t('brandName')}`,
    description: t('pages.requestEdit.description'),
  };
}

const EditPage: FC<EditPageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEditGlobal = auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.EDIT]);

  // First get the request to check area permissions
  const defaultValues = await getRequestById(tenantId, slug);

  if (!defaultValues) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/requests', params: { tenantId } } });
  }

  // Check if user has scoped edit permission for this request's area
  const canEditScoped = auth.hasAreaPermissions(defaultValues.areaId.value, [PermissionActions.REQUEST_MANAGEMENT.SCOPED_EDIT]);

  if (!canEditGlobal && !canEditScoped) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/requests/[slug]', params: { tenantId, slug } } });
  }

  const priorities = await getPrioritiesAsOptions(tenantId);

  return <RequestFormStepper tenantId={tenantId} defaultValues={defaultValues} prioritiesOptions={priorities} />;
};

export default EditPage;
