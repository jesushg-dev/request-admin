import { FC } from 'react';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/server/auth-server';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { ApiKeyEditForm } from '@/components/common/setting/api-key-edit-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface EditApiKeyPageProps {
  params: Promise<{ locale: Locale; tenantId: string; keyId: string }>;
}

const EditApiKeyPage: FC<EditApiKeyPageProps> = async ({ params }) => {
  const { keyId } = await params;
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
    <PageDialogWrapper title={t('editForm.title')} description={t('editForm.description')}>
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
    </PageDialogWrapper>
  );
};

export default EditApiKeyPage;
