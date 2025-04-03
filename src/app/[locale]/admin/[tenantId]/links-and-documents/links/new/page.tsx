import { FC } from 'react';
import { getPathname } from '@/i18n/routing';
import { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';

import { documentReferencesLoader } from '@/lib/document';
import { LinkForm } from '@/components/common/data-room/link-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewPageProps {
  params: Promise<{ tenantId: string; locale: Locale }>;
  searchParams: Promise<SearchParams>;
}

const NewPage: FC<NewPageProps> = async ({ params, searchParams }) => {
  const { locale, tenantId } = await params;
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
