import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { db } from '@/server/db-server';
import { getTranslations } from 'next-intl/server';

import { IdentificationTypeForm } from '@/components/common/identification-type/identification-type-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface EditIdentificationTypePageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const EditIdentificationTypePage: FC<EditIdentificationTypePageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.IDENTIFICATION_TYPE.EDIT]);
  
  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/security/identification-types', params: { tenantId } } });
  }

  const t = await getTranslations('admin.identificationType.form');

  const defaultValues = await db.identificationType.findFirst({
    where: { id: slug, tenantId },
    select: { id: true, name: true, description: true, regex: true },
  });

  if (!defaultValues) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/security/identification-types', params: { tenantId } } });
  }

  return (
    <PageDialogWrapper title={t('editIdentificationType')} description={t('editIdentificationTypeDescription')}>
      <IdentificationTypeForm tenantId={tenantId} defaultValues={{ ...defaultValues, description: defaultValues.description ?? undefined, regex: defaultValues.regex ?? undefined } } />
    </PageDialogWrapper>
  );
};

export default EditIdentificationTypePage;
