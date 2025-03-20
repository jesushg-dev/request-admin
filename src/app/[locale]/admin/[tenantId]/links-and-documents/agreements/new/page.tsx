import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import { AgreementForm } from '@/components/common/data-room/agreement-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewPageProps {
  params: Promise<{ tenantId: string }>;
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const t = await getTranslations('admin.agreement.form');
  const { tenantId } = await params;

  return (
    <PageCardWrapper title={t('titleCreate')} description={t('subtitleCreate')}>
      <AgreementForm tenantId={tenantId} />
    </PageCardWrapper>
  );
};

export default NewPage;
