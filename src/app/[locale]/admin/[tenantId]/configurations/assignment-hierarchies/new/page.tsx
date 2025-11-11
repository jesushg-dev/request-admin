import { type Metadata } from 'next';
import { FC } from 'react';
import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { upsertAssignmentHierarchy } from '@/actions/hierarchy';

import { HierarchyFormStepper } from '@/components/common/hierarchy/hierarchy-form-stepper';

interface CreateAssignmentHierarchyPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

export async function generateMetadata(props: CreateAssignmentHierarchyPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.assignmentHierarchyNew.title')} - ${t('brandName')}`,
    description: t('pages.assignmentHierarchyNew.description'),
  };
}

const CreateAssignmentHierarchyPage: FC<CreateAssignmentHierarchyPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.ASSIGNMENT_HIERARCHY.CREATE]);
  
  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/assignment-hierarchies', params: { tenantId } } });
  }

  return <HierarchyFormStepper tenantId={tenantId} locale={locale} upsertAction={upsertAssignmentHierarchy} />;
};

export default CreateAssignmentHierarchyPage;
