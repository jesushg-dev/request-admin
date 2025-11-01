import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import DocumentsPageClient from '@/components/common/documents/documents-page-client';

interface DocumentsPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export default async function DocumentsPage({ params }: DocumentsPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canViewDocuments = auth.hasPermissions([PermissionActions.DOCUMENT_MANAGEMENT.VIEW]);
  
  if (!canViewDocuments) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.DOCUMENT_MANAGEMENT.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.DOCUMENT_MANAGEMENT.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.DOCUMENT_MANAGEMENT.DELETE]);

  return <DocumentsPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
