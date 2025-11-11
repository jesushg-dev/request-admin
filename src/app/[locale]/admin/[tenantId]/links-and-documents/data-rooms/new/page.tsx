import { type Metadata } from 'next';
import { FC } from 'react';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';

import { DataroomForm } from '@/components/common/data-room/dataroom-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

export async function generateMetadata(props: NewPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.dataRoomNew.title')} - ${t('brandName')}`,
    description: t('pages.dataRoomNew.description'),
  };
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.DATA_ROOM.CREATE]);
  
  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms', params: { tenantId } } });
  }

  const t = await getTranslations('admin.dataroom.create');

  return (
    <PageCardWrapper title={t('title')} description={t('subtitle')}>
      <DataroomForm tenantId={tenantId} />
    </PageCardWrapper>
  );
};

export default NewPage;
