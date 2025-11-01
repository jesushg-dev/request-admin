import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getPathname } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';
import { db } from '@/server/db-client';

import { documentReferencesLoader } from '@/lib/document';
import { LinkForm } from '@/components/common/data-room/link-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface EditPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
  searchParams: Promise<SearchParams>;
}

const EditPage: FC<EditPageProps> = async ({ params, searchParams }) => {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.SHARED_LINK.EDIT]);
  
  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/links', params: { tenantId } } });
  }

  const t = await getTranslations('admin.link.form');
  const { documentId, dataroomId, callbackUrl, linkType } = await documentReferencesLoader(searchParams);
  const finalCallbackUrl = callbackUrl ? callbackUrl : getPathname({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/documents', params: { tenantId } } });

  // Get existing link data
  const link = await db.link.findFirst({
    where: { id: slug, tenantId },
    select: {
      id: true,
      name: true,
      expiresAt: true,
      password: true,
      emailProtected: true,
      emailAuthenticated: true,
      enableScreenshotProtection: true,
      enableWatermark: true,
      agreementId: true,
      allowDownload: true,
      enableNotification: true,
      enableFeedback: true,
      enableQuestion: true,
      allowList: true,
      denyList: true,
      customField: {
        select: {
          id: true,
          type: true,
          label: true,
          placeholder: true,
          required: true,
          disabled: true,
        },
      },
    },
  });

  if (!link) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/links', params: { tenantId } } });
  }

  // Parse allowList and denyList from JSON strings
  const allowList = link.allowList ? (JSON.parse(link.allowList) as Array<{ value: string; type: 'EMAIL' | 'DOMAIN' }>) : [];
  const denyList = link.denyList ? (JSON.parse(link.denyList) as Array<{ value: string; type: 'EMAIL' | 'DOMAIN' }>) : [];

  // Map custom fields
  const customFields = link.customField.map((field) => ({
    id: field.id,
    type: field.type,
    label: field.label,
    placeholder: field.placeholder || undefined,
    description: undefined, // CustomField model doesn't have description field
    required: field.required,
    disabled: field.disabled,
  }));

  // Map the link data to form values
  const initialValues = {
    id: link.id,
    name: link.name || '',
    expirationDate: link.expiresAt ? new Date(link.expiresAt) : undefined,
    enablePassword: !!link.password,
    password: link.password || '',
    emailProtected: link.emailProtected,
    emailAuthenticated: link.emailAuthenticated,
    enableScreenshotProtection: link.enableScreenshotProtection ?? false,
    enableWatermark: link.enableWatermark ?? false,
    enableAgreement: !!link.agreementId,
    agreementId: link.agreementId || undefined,
    allowDownload: link.allowDownload ?? false,
    enableNotification: link.enableNotification ?? false,
    enableFeedback: link.enableFeedback ?? false,
    enableQuestion: link.enableQuestion ?? false,
    allowSpecificViewers: allowList.length > 0,
    allowedViewers: allowList,
    blockSpecificViewers: denyList.length > 0,
    denyViewers: denyList,
    customFields,
  };

  return (
    <PageDialogWrapper title={t('titleEdit')} description={t('subtitleCreate')}>
      <LinkForm tenantId={tenantId} documentId={documentId} dataroomId={dataroomId} callbackUrl={finalCallbackUrl} linkType={linkType} initialValues={initialValues} />
    </PageDialogWrapper>
  );
};

export default EditPage;
