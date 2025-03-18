import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import { ApiKeyCreateForm } from '@/components/common/setting/api-key-form';
import { PageCardWrapper } from '@/components/page-card-wrapper';

interface NewApiKeyPageProps {
  params: Promise<{ tenantId: string }>;
}

const NewApiKeyPage: FC<NewApiKeyPageProps> = async ({ params }) => {
  const { tenantId } = await params;
  const t = await getTranslations('admin.setting.apiKeys');

  return (
    <PageCardWrapper title={t('createForm.title')} description={t('createForm.subtitle')}>
      <ApiKeyCreateForm tenantId={tenantId} />
    </PageCardWrapper>
  );
};

export default NewApiKeyPage;
