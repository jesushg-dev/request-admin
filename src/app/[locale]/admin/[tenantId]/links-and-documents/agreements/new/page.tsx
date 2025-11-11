import { type Metadata } from 'next';
import { FC } from 'react';
import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

import { AgreementForm } from '@/components/common/data-room/agreement-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

export async function generateMetadata(props: NewPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.agreementNew.title')} - ${t('brandName')}`,
    description: t('pages.agreementNew.description'),
  };
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.AGREEMENT.CREATE]);
  
  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/agreements', params: { tenantId } } });
  }

  const t = await getTranslations('admin.agreement.form');

  return (
    <PageCardWrapper title={t('titleCreate')} description={t('subtitleCreate')}>
      <AgreementForm tenantId={tenantId} />
    </PageCardWrapper>
  );
};

export default NewPage;
