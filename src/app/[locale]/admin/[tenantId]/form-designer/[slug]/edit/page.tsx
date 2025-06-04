import { GetFormById } from '@/actions/form';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';

import FormBuilder from '@/components/builder-form/form-builder';

interface BuilderPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

async function BuilderPage({ params }: BuilderPageProps) {
  const { locale, tenantId, slug } = await params;
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
