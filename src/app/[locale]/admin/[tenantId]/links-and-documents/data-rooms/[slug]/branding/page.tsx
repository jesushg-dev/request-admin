import { FC } from 'react';
import { db } from '@/server/db-client';

import { DataroomBrandingForm } from '@/components/common/data-room/dataroom-branding-form';

interface EditBrandingPageProps {
  params: Promise<{ tenantId: string; slug: string }>;
}

const EditPage: FC<EditBrandingPageProps> = async ({ params }) => {
  const { tenantId, slug } = await params;

  const initialValues = await db.dataroomBrand.findFirst({
    where: { dataroomId: slug, tenantId },
    select: { id: true, logo: true, dataroomId: true, banner: true, brandColor: true, accentColor: true },
  });

  return <DataroomBrandingForm tenantId={tenantId} initialValues={initialValues} />;
};

export default EditPage;
