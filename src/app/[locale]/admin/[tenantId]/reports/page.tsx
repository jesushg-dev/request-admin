import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { ReportsPageClient } from '@/components/common/reports/reports-page-client';

interface ReportsPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { locale, tenantId } = await params;

  // Server-side permission check - blocks access before any client component renders
  const auth = await getAuthContext(tenantId);
  const canViewReports = auth.hasPermissions([PermissionActions.REPORTS.VIEW]);
  
  if (!canViewReports) {
    // Redirect to dashboard if user doesn't have permission
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  // Check export permission to pass to client component
  const canExportReports = auth.hasPermissions([PermissionActions.REPORTS.EXPORT]);

  // Only render client component if user has view permission
  return <ReportsPageClient tenantId={tenantId} canExportReports={canExportReports} />;
}
