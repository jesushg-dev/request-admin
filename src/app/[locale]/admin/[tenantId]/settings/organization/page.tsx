import { FC } from 'react';
import { getTenantInformation } from '@/actions/tenant';
import { type Locale } from 'next-intl';

import TenantForm from '@/components/common/tenant/tenant-form';

interface EditPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

const EditPage: FC<EditPageProps> = async ({ params }) => {
  const { tenantId } = await params;
  const organization = await getTenantInformation(tenantId);

  return (
    <TenantForm
      defaultValues={{
        values: organization,
        organizationId: tenantId,
      }}
    />
  );
};

export default EditPage;
