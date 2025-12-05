import { FC } from 'react';
import { type Metadata } from 'next';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import PriorityForm from '@/components/common/priority/priority-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewPriorityPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

export async function generateMetadata(props: NewPriorityPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.priorityNew.title')} - ${t('brandName')}`,
    description: t('pages.priorityNew.description'),
  };
}

const NewPriorityPage: FC<NewPriorityPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.PRIORITY.CREATE]);

  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/priorities', params: { tenantId } } });
  }

  const t = await getTranslations('admin.requestPriorityType.form');

  return (
    <PageCardWrapper title={t('header.title')} description={t('header.descriptionCreate')}>
      <PriorityForm tenantId={tenantId} />
    </PageCardWrapper>
  );
};

export default NewPriorityPage;
