import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import AssignRequestsForm from '@/components/common/request/assign-requests-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface AssignMassivelyRequestsPageProps {
  params: Promise<{ tenantId: string }>;
}

const AssignMassivelyRequestsPage: FC<AssignMassivelyRequestsPageProps> = async ({ params }) => {
  await params;
  const t = await getTranslations('admin.request.massiveAssign');

  return (
    <PageDialogWrapper title={t('title')} description={t('description')}>
      <AssignRequestsForm />
    </PageDialogWrapper>
  );
};

export default AssignMassivelyRequestsPage;
