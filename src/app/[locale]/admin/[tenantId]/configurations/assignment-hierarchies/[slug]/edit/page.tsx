import { type Metadata } from 'next';
import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getTranslations } from 'next-intl/server';
import { getAssignmentHierarchyAndLevelsById, upsertAssignmentHierarchy } from '@/actions/hierarchy';

import { HierarchyFormStepper } from '@/components/common/hierarchy/hierarchy-form-stepper';

interface UpdateAssignmentHierarchyPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

export async function generateMetadata(props: UpdateAssignmentHierarchyPageProps): Promise<Metadata> {
  const { locale, tenantId, slug } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });
  
  const hierarchy = await getAssignmentHierarchyAndLevelsById(tenantId, slug);
  const hierarchyName = hierarchy?.name || `Jerarquía #${slug}`;

  return {
    title: `${hierarchyName} - Editar Jerarquía de Asignación - ${t('brandName')}`,
    description: 'Editar la jerarquía de asignación',
  };
}

const UpdateAssignmentHierarchyPage: FC<UpdateAssignmentHierarchyPageProps> = async ({ params }) => {
  const { tenantId, locale, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.ASSIGNMENT_HIERARCHY.EDIT]);
  
  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/assignment-hierarchies', params: { tenantId } } });
  }

  const defaultValues = await getAssignmentHierarchyAndLevelsById(tenantId, slug);
  
  if (!defaultValues) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/assignment-hierarchies', params: { tenantId } } });
  }

  const isInUse = defaultValues.categoriesCount > 0;

  return <HierarchyFormStepper defaultValues={defaultValues} locale={locale} isInUse={isInUse} tenantId={tenantId} upsertAction={upsertAssignmentHierarchy} />;
};

export default UpdateAssignmentHierarchyPage;
