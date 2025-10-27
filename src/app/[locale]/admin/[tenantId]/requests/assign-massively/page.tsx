import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import AssignRequestsForm from '@/components/common/request/assign-requests-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface AssignMassivelyRequestsPageProps {
  params: Promise<{ tenantId: string }>;
}

const AssignMassivelyRequestsPage: FC<AssignMassivelyRequestsPageProps> = async ({ params }) => {
  const t = await getTranslations('admin.request.massiveAssign');

  return (
    <PageCardWrapper title={t('title')} description={t('description')}>
      <AssignRequestsForm />
    </PageCardWrapper>
  );
};

export default AssignMassivelyRequestsPage;
