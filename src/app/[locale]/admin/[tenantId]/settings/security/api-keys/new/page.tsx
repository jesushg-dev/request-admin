import { FC } from 'react';
import { type Metadata } from 'next';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { ApiKeyCreateForm } from '@/components/common/setting/api-key-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewApiKeyPageProps {
  params: Promise<{ locale: string; tenantId: string }>;
}

export async function generateMetadata(props: NewApiKeyPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.apiKeyNew.title')} - ${t('brandName')}`,
    description: t('pages.apiKeyNew.description'),
  };
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
