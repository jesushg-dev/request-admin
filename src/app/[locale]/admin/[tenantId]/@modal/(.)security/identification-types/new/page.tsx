import { FC } from 'react';
import { Locale } from 'next-intl';

import { IdentificationTypeForm } from '@/components/common/identification-type/Identification-type-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewIdentificationTypePageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const NewIdentificationTypePage: FC<NewIdentificationTypePageProps> = async ({ params }) => {
  const { tenantId } = await params;
  return (
    <PageDialogWrapper title="New Identification Type">
      <IdentificationTypeForm tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default NewIdentificationTypePage;
