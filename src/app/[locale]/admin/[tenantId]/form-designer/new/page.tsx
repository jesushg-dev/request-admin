import { FC } from 'react';
import { type Metadata } from 'next';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import CreateNewForm from '@/components/builder-form/create-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewFormPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

export async function generateMetadata(props: NewFormPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.formNew.title')} - ${t('brandName')}`,
    description: t('pages.formNew.description'),
  };
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
    <PageCardWrapper title={t('createNewForm')} description={t('dialogDescription')}>
      <CreateNewForm />
    </PageCardWrapper>
  );
};

export default NewFormPage;
