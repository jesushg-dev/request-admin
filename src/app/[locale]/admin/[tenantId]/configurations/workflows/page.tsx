import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import WorkflowsPageClient from '@/components/common/workflow/workflows-page-client';

interface WorkflowsPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export default async function WorkflowsPage({ params }: WorkflowsPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canView = auth.hasPermissions([PermissionActions.WORKFLOW.VIEW]);
  
  if (!canView) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.WORKFLOW.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.WORKFLOW.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.WORKFLOW.DELETE]);

  return <WorkflowsPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
