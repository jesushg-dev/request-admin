import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getTranslations } from 'next-intl/server';

import { AgreementForm } from '@/components/common/data-room/agreement-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.AGREEMENT.CREATE]);
  
  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/agreements', params: { tenantId } } });
  }

  const t = await getTranslations('admin.agreement');

  return (
    <PageDialogWrapper title={t('form.titleCreate')} description={t('form.subtitleCreate')}>
      <AgreementForm tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default NewPage;
