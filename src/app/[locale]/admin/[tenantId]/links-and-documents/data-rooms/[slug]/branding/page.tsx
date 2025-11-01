import { FC } from 'react';
import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { db } from '@/server/db-client';

import { DataroomBrandingForm } from '@/components/common/data-room/dataroom-branding-form';

interface EditBrandingPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

const EditPage: FC<EditBrandingPageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.DATA_ROOM.EDIT]);
  
  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]', params: { tenantId, slug } } });
  }

  const initialValues = await db.dataroomBrand.findFirst({
    where: { dataroomId: slug, tenantId },
    select: { id: true, logo: true, dataroomId: true, banner: true, brandColor: true, accentColor: true },
  });

  return <DataroomBrandingForm tenantId={tenantId} initialValues={initialValues} />;
};

export default EditPage;
