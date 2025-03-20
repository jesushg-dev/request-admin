import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import { DataroomForm } from '@/components/common/data-room/dataroom-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewPageProps {
  params: Promise<{ tenantId: string }>;
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const t = await getTranslations('admin.dataroom.create');
  const { tenantId } = await params;

  return (
    <PageDialogWrapper title={t('title')} description={t('subtitle')}>
      <DataroomForm tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default NewPage;
