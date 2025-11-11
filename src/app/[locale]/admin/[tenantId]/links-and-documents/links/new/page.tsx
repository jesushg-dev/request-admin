import { type Metadata } from 'next';
import { FC } from 'react';
import { type Locale } from 'next-intl';
import { getPathname } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';

import { documentReferencesLoader } from '@/lib/document';
import { LinkForm } from '@/components/common/data-room/link-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewPageProps {
  params: Promise<{ tenantId: string; locale: Locale }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(props: { params: Promise<{ locale: string; tenantId: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.linkNew.title')} - ${t('brandName')}`,
    description: t('pages.linkNew.description'),
  };
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
    <PageCardWrapper title={t('titleCreate')} description={t('subtitleCreate')}>
      <LinkForm tenantId={tenantId} documentId={documentId} dataroomId={dataroomId} callbackUrl={finalCallbackUrl} linkType={linkType} />
    </PageCardWrapper>
  );
};

export default NewPage;
