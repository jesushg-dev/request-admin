import { FC } from 'react';
import { redirect } from '@/i18n/routing';
import { db } from '@/server/db-server';
import { Locale } from 'next-intl';

import { IdentificationTypeForm } from '@/components/common/identification-type/Identification-type-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface EditIdentificationTypePageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const EditIdentificationTypePage: FC<EditIdentificationTypePageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const defaultValues = await db.identificationType.findFirst({
    where: { id: slug, tenantId },
    select: { id: true, name: true, description: true, regex: true },
  });

  if (!defaultValues) {
    return redirect({ href: { pathname: '/admin/[tenantId]/security/identification-types', params: { tenantId } }, locale });
  }

  return (
    <PageDialogWrapper title="Edit Identification Type">
      <IdentificationTypeForm tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default EditIdentificationTypePage;
