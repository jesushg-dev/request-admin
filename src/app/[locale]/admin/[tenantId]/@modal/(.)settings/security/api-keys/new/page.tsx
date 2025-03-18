import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import { ApiKeyCreateForm } from '@/components/common/setting/api-key-form';
import PageDialogWrapper from '@/components/page-dialog-wrapper';

interface NewApiKeyPageProps {
  params: Promise<{ tenantId: string }>;
}

const NewApiKeyPage: FC<NewApiKeyPageProps> = async ({ params }) => {
  const { tenantId } = await params;
  const t = await getTranslations('admin.setting.apiKeys');

  return (
    <PageDialogWrapper title={t('createForm.title')} description={t('createForm.subtitle')}>
      <ApiKeyCreateForm tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default NewApiKeyPage;
