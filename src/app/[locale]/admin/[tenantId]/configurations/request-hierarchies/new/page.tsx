import { type Metadata } from 'next';
import { FC } from 'react';
import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { upsertRequestHierarchy } from '@/actions/hierarchy';

import { HierarchyFormStepper } from '@/components/common/hierarchy/hierarchy-form-stepper';

interface CreateRequestHierarchyPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

export async function generateMetadata(props: CreateRequestHierarchyPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.requestHierarchyNew.title')} - ${t('brandName')}`,
    description: t('pages.requestHierarchyNew.description'),
  };
}

const CreateRequestHierarchyPage: FC<CreateRequestHierarchyPageProps> = async ({ params }) => {
  const { tenantId, locale } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.REQUEST_HIERARCHY.CREATE]);
  
  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/request-hierarchies', params: { tenantId } } });
  }

  return <HierarchyFormStepper tenantId={tenantId} locale={locale} upsertAction={upsertRequestHierarchy} />;
};

export default CreateRequestHierarchyPage;
