import { type Metadata } from 'next';
import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import AssignmentHierarchiesPageClient from '@/components/common/hierarchy/assignment-hierarchies-page-client';

interface AssignmentHierarchiesPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export async function generateMetadata(props: AssignmentHierarchiesPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.assignmentHierarchies.title')} - ${t('brandName')}`,
    description: t('pages.assignmentHierarchies.description'),
  };
}

export default async function AssignmentHierarchiesPage({ params }: AssignmentHierarchiesPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canView = auth.hasPermissions([PermissionActions.ASSIGNMENT_HIERARCHY.VIEW]);
  
  if (!canView) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.ASSIGNMENT_HIERARCHY.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.ASSIGNMENT_HIERARCHY.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.ASSIGNMENT_HIERARCHY.DELETE]);

  return <AssignmentHierarchiesPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
