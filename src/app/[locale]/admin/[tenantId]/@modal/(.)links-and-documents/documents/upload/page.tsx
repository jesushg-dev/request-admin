import { type FC } from 'react';
import { getPathname } from '@/i18n/routing';
import { Locale } from 'next-intl';
import { SearchParams } from 'nuqs/server';

import { loadSearchParams } from '@/lib/upload';
import { DocumentUpload } from '@/components/common/documents/document-upload';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
  searchParams: Promise<SearchParams>;
}

const NewPage: FC<NewPageProps> = async ({ params, searchParams }) => {
  const { locale, tenantId } = await params;
  const { folderId, dataroomId, dataroomName, callbackUrl } = await loadSearchParams(searchParams);

  return (
    <PageDialogWrapper title={dataroomName ? `Upload to ${dataroomName}` : 'Upload Document'} description="Drag and drop files or click to upload">
      <DocumentUpload
        locale={locale}
        tenantId={tenantId}
        folderId={folderId}
        dataroomId={dataroomId}
        callbackUrl={callbackUrl ? callbackUrl : getPathname({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/documents', params: { tenantId } } })}
      />
    </PageDialogWrapper>
  );
};

export default NewPage;
