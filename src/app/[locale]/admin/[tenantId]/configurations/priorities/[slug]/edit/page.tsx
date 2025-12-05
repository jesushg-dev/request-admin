import { FC } from 'react';
import { type Metadata } from 'next';
import { getAuthContext } from '@/actions/authorization';
import { getRequestPriorityTypeAsFormById } from '@/actions/priority';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import PriorityForm from '@/components/common/priority/priority-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface EditPriorityPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

export async function generateMetadata(props: EditPriorityPageProps): Promise<Metadata> {
  const { locale, tenantId, slug } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  const priority = await getRequestPriorityTypeAsFormById(tenantId, slug);
  const priorityName = priority?.name || `Prioridad #${slug}`;

  return {
    title: `${priorityName} - ${t('pages.priorityEdit.title')} - ${t('brandName')}`,
    description: t('pages.priorityEdit.description'),
  };
}

const EditPriorityPage: FC<EditPriorityPageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.PRIORITY.EDIT]);

  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/priorities', params: { tenantId } } });
  }

  const t = await getTranslations('admin.requestPriorityType.form');

  const priority = await getRequestPriorityTypeAsFormById(slug, tenantId);

  if (!priority) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/priorities', params: { tenantId } } });
  }

  return (
    <PageCardWrapper title={t('header.title')} description={t('header.descriptionUpdate')}>
      <PriorityForm tenantId={tenantId} initialValues={{ ...priority, id: slug }} />
    </PageCardWrapper>
  );
};

export default EditPriorityPage;
