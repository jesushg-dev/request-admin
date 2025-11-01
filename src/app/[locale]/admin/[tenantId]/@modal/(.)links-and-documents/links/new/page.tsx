import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getPathname } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';

import { documentReferencesLoader } from '@/lib/document';
import { LinkForm } from '@/components/common/data-room/link-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
  searchParams: Promise<SearchParams>;
}

const NewPage: FC<NewPageProps> = async ({ params, searchParams }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.SHARED_LINK.CREATE]);
  
  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/links', params: { tenantId } } });
  }

  const t = await getTranslations('admin.link.form');
  const { documentId, dataroomId, callbackUrl, linkType } = await documentReferencesLoader(searchParams);
  const finalCallbackUrl = callbackUrl ? callbackUrl : getPathname({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/documents', params: { tenantId } } });

  return (
    <PageDialogWrapper title={t('titleCreate')} description={t('subtitleCreate')}>
      <LinkForm tenantId={tenantId} documentId={documentId} dataroomId={dataroomId} callbackUrl={finalCallbackUrl} linkType={linkType} />
    </PageDialogWrapper>
  );
};

export default NewPage;
