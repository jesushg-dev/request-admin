import { FC } from 'react';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { IdentificationTypeForm } from '@/components/common/identification-type/identification-type-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewIdentificationTypePageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const NewIdentificationTypePage: FC<NewIdentificationTypePageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.IDENTIFICATION_TYPE.CREATE]);

  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/security/identification-types', params: { tenantId } } });
  }

  const t = await getTranslations('admin.identificationType.form');

  return (
    <PageDialogWrapper title={t('newIdentificationType')} description={t('newIdentificationTypeDescription')}>
      <IdentificationTypeForm tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default NewIdentificationTypePage;
