import { FC } from 'react';
import { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { IdentificationTypeForm } from '@/components/common/identification-type/identification-type-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewIdentificationTypePageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const NewIdentificationTypePage: FC<NewIdentificationTypePageProps> = async ({ params }) => {
  const { tenantId } = await params;
  const t = await getTranslations('admin.identificationType.form');

  return (
    <PageDialogWrapper title={t('newIdentificationType')} description={t('newIdentificationTypeDescription')}>
      <IdentificationTypeForm tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default NewIdentificationTypePage;
