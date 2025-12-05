import { FC } from 'react';
import { type Metadata } from 'next';
import { getAuthContext } from '@/actions/authorization';
import { getRequestHierarchyAndLevelsById, upsertRequestHierarchy } from '@/actions/hierarchy';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { HierarchyFormStepper } from '@/components/common/hierarchy/hierarchy-form-stepper';

interface UpdateRequestHierarchyPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

export async function generateMetadata(props: UpdateRequestHierarchyPageProps): Promise<Metadata> {
  const { locale, tenantId, slug } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  const hierarchy = await getRequestHierarchyAndLevelsById(tenantId, slug);
  const hierarchyName = hierarchy?.name || `Jerarquía #${slug}`;

  return {
    title: `${hierarchyName} - ${t('pages.requestHierarchyEdit.title')} - ${t('brandName')}`,
    description: t('pages.requestHierarchyEdit.description'),
  };
}

const UpdateRequestHierarchyPage: FC<UpdateRequestHierarchyPageProps> = async ({ params }) => {
  const { tenantId, slug, locale } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.REQUEST_HIERARCHY.EDIT]);

  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/request-hierarchies', params: { tenantId } } });
  }

  const defaultValues = await getRequestHierarchyAndLevelsById(tenantId, slug);

  if (!defaultValues) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/request-hierarchies', params: { tenantId } } });
  }

  const isInUse = defaultValues.categoriesCount > 0;

  return <HierarchyFormStepper defaultValues={defaultValues} isInUse={isInUse} tenantId={tenantId} locale={locale} upsertAction={upsertRequestHierarchy} />;
};

export default UpdateRequestHierarchyPage;
