import { FC } from 'react';
import { db } from '@/server/db-client';
import { getTranslations } from 'next-intl/server';

import { AgreementForm } from '@/components/common/data-room/agreement-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface EditPageProps {
  params: Promise<{ tenantId: string; slug: string }>;
}

const EditPage: FC<EditPageProps> = async ({ params }) => {
  const { tenantId, slug } = await params;
  const t = await getTranslations('admin.agreement.form');

  const initialValues = await db.agreement.findFirst({
    where: { id: slug, tenantId },
    select: { id: true, name: true, description: true, content: true, requireName: true },
  });

  return (
    <PageCardWrapper title={t('titleEdit')} description={t('subtitleEdit')}>
      <AgreementForm tenantId={tenantId} initialValues={initialValues} />
    </PageCardWrapper>
  );
};

export default EditPage;
