import { FC } from 'react';
import { getRequestPriorityTypeAsFormById } from '@/actions/priority';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import PriorityForm from '@/components/common/priority/priority-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface UpdatePriorityPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const UpdatePriorityPage: FC<UpdatePriorityPageProps> = async ({ params }) => {
  const { tenantId, slug } = await params;
  const t = await getTranslations('admin.requestPriorityType.form');

  const priority = await getRequestPriorityTypeAsFormById(slug, tenantId);

  return (
    <PageCardWrapper title={t('header.title')} description={t('header.descriptionUpdate')}>
      <PriorityForm tenantId={tenantId} initialValues={{ ...priority, id: slug }} />
    </PageCardWrapper>
  );
};

export default UpdatePriorityPage;
