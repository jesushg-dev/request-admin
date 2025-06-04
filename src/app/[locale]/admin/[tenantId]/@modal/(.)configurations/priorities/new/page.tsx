import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import PriorityForm from '@/components/common/priority/priority-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewPriorityPageProps {
  params: Promise<{ tenantId: string }>;
}

const NewPriorityPage: FC<NewPriorityPageProps> = async ({ params }) => {
  const { tenantId } = await params;
  const t = await getTranslations('admin.requestPriorityType.form');

  return (
    <PageDialogWrapper title={t('header.title')} description={t('header.descriptionCreate')}>
      <PriorityForm tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default NewPriorityPage;
