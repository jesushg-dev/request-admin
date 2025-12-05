import { FC } from 'react';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import CreateNewForm from '@/components/builder-form/create-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface NewFormPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const NewFormPage: FC<NewFormPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.FORM_DESIGNER.CREATE]);

  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/form-designer', params: { tenantId } } });
  }

  const t = await getTranslations('component.form');

  return (
    <PageDialogWrapper title={t('createNewForm')} description={t('dialogDescription')}>
      <CreateNewForm />
    </PageDialogWrapper>
  );
};

export default NewFormPage;
