import { FC } from 'react';
import { type Metadata } from 'next';
import { getAreaByTenantIdAndAreaId } from '@/actions/area';
import { getAuthContext } from '@/actions/authorization';
import { getAssignmentHierarchiesAndLevelsByTenantId } from '@/actions/hierarchy';
import { getModuleByTenantIdAndScope } from '@/actions/module';
import { getRequirementsAsOptions } from '@/actions/requirement';
import { getUsersAsOptions } from '@/actions/user';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import AreaFormStepper from '@/components/common/area/area-form-stepper';

interface EditPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

export async function generateMetadata(props: EditPageProps): Promise<Metadata> {
  const { locale, tenantId, slug } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  const area = await getAreaByTenantIdAndAreaId(tenantId, slug);
  const areaName = area?.name || `Área #${slug}`;

  return {
    title: `${areaName} - Editar Área - ${t('brandName')}`,
    description: 'Editar los detalles del área',
  };
}

const EditPage: FC<EditPageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.AREA.EDIT]);

  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/areas', params: { tenantId } } });
  }

  // Fetch hierarchy data using Prisma
  const userOptions = await getUsersAsOptions(tenantId);
  const requirements = await getRequirementsAsOptions(tenantId);
  const area = await getAreaByTenantIdAndAreaId(tenantId, slug);

  if (!area) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/areas', params: { tenantId } } });
  }

  const modules = await getModuleByTenantIdAndScope(tenantId, 'area');
  const hierarchies = await getAssignmentHierarchiesAndLevelsByTenantId(locale, tenantId);
  return <AreaFormStepper tenantId={tenantId} defaultValues={area} assignmentHierarchies={hierarchies} requirements={requirements} userOptions={userOptions} moduleWithFeatures={modules} />;
};

export default EditPage;
