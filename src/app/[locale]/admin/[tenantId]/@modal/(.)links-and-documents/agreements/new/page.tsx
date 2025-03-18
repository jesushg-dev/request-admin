import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import { AgreementForm } from '@/components/common/agreement/agreement-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewPageProps {
  params: Promise<{ tenantId: string }>;
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const t = await getTranslations('admin.agreement');
  const { tenantId } = await params;

  return (
    <PageDialogWrapper title={t('form.title')} description={t('form.subtitle')}>
      <AgreementForm tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default NewPage;
