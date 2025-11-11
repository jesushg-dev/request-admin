import { type Metadata } from 'next';
import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import FormDesignerPageClient from '@/components/common/form-designer/form-designer-page-client';

interface FormDesignerPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export async function generateMetadata(props: FormDesignerPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.formDesigner.title')} - ${t('brandName')}`,
    description: t('pages.formDesigner.description'),
  };
}

export default async function FormDesignerPage({ params }: FormDesignerPageProps) {
  const { locale, tenantId } = await params;

  // Server-side permission check - blocks access before any client component renders
  const auth = await getAuthContext(tenantId);
  const canViewForms = auth.hasPermissions([PermissionActions.FORM_DESIGNER.VIEW]);
  
  if (!canViewForms) {
    // Redirect to dashboard if user doesn't have permission
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  // Check other permissions to pass to client component
  const canCreate = auth.hasPermissions([PermissionActions.FORM_DESIGNER.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.FORM_DESIGNER.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.FORM_DESIGNER.DELETE]);

  // Only render client component if user has view permission
  return <FormDesignerPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
