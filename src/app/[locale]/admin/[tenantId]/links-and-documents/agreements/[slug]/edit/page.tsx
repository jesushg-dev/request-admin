import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getDb } from '@/server/db-client';
import { getTranslations } from 'next-intl/server';

import { AgreementForm } from '@/components/common/data-room/agreement-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface EditPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

const EditPage: FC<EditPageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.AGREEMENT.EDIT]);
  
  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/agreements', params: { tenantId } } });
  }

  const t = await getTranslations('admin.agreement.form');

  const db = await getDb();
  const initialValues = await db.agreement.findFirst({
    where: { id: slug, tenantId },
    select: { id: true, name: true, description: true, content: true, requireName: true },
  });

  if (!initialValues) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/agreements', params: { tenantId } } });
  }

  return (
    <PageCardWrapper title={t('titleEdit')} description={t('subtitleEdit')}>
      <AgreementForm tenantId={tenantId} initialValues={initialValues} />
    </PageCardWrapper>
  );
};

export default EditPage;
