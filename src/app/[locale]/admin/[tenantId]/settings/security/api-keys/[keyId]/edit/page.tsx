import { FC } from 'react';
import { type Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/server/auth-server';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { ApiKeyEditForm } from '@/components/common/setting/api-key-edit-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface EditApiKeyPageProps {
  params: Promise<{ locale: Locale; tenantId: string; keyId: string }>;
}

export async function generateMetadata(props: EditApiKeyPageProps): Promise<Metadata> {
  const { locale, keyId } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.apiKeysEdit.title')} - ${t('brandName')}`,
    description: t('pages.apiKeysEdit.description'),
  };
}

const EditApiKeyPage: FC<EditApiKeyPageProps> = async ({ params }) => {
  const { tenantId, keyId, locale } = await params;
  const headersList = await headers();
  const t = await getTranslations('admin.setting.apiKeys');

  let apiKey: Awaited<ReturnType<typeof auth.api.getApiKey>>;

  try {
    apiKey = await auth.api.getApiKey({
      query: {
        id: keyId,
      },
      headers: headersList,
    });
  } catch (error) {
    notFound();
  }

  if (!apiKey) {
    notFound();
  }

  return (
    <PageCardWrapper title={t('editForm.title')} description={t('editForm.description')}>
      <ApiKeyEditForm
        keyId={keyId}
        defaultValues={{
          name: apiKey.name,
          enabled: apiKey.enabled,
          rateLimitEnabled: apiKey.rateLimitEnabled,
          rateLimitMax: apiKey.rateLimitMax,
          rateLimitTimeWindow: apiKey.rateLimitTimeWindow,
          remaining: apiKey.remaining,
          refillAmount: apiKey.refillAmount,
          refillInterval: apiKey.refillInterval,
          metadata: apiKey.metadata,
        }}
      />
    </PageCardWrapper>
  );
};

export default EditApiKeyPage;
