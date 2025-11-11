import { type Metadata } from 'next';
import { GetFormById } from '@/actions/form';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import FormBuilder from '@/components/builder-form/form-builder';

interface BuilderPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

export async function generateMetadata(props: BuilderPageProps): Promise<Metadata> {
  const { locale, tenantId, slug } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });
  
  const form = await GetFormById(slug, tenantId);
  const formName = form?.name || `Formulario #${slug}`;

  return {
    title: `${formName} - Editar Formulario - ${t('brandName')}`,
    description: 'Editar el formulario',
  };
}

async function BuilderPage({ params }: BuilderPageProps) {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEditForms = auth.hasPermissions([PermissionActions.FORM_DESIGNER.EDIT]);
  
  if (!canEditForms) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/form-designer', params: { tenantId } } });
  }

  const form = await GetFormById(slug, tenantId);
  if (!form) {
    throw new Error('form not found');
  }

  if (form.published) {
    redirect({ href: { pathname: '/admin/[tenantId]/form-designer/[slug]', params: { tenantId, slug } }, locale });
  }

  return <FormBuilder form={form} />;
}

export default BuilderPage;
