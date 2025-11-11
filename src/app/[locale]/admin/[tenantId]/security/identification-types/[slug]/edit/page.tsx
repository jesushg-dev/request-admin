import { type Metadata } from 'next';
import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getDb } from '@/server/db-client';
import { getTranslations } from 'next-intl/server';

import { IdentificationTypeForm } from '@/components/common/identification-type/identification-type-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface EditIdentificationTypePageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

export async function generateMetadata(props: EditIdentificationTypePageProps): Promise<Metadata> {
  const { locale, tenantId, slug } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });
  
  const db = await getDb();
  const identificationType = await db.identificationType.findUnique({
    where: { id: slug, tenantId },
    select: { name: true },
  });
  const identificationTypeName = identificationType?.name || `Tipo de Identificación #${slug}`;

  return {
    title: `${identificationTypeName} - ${t('pages.identificationTypeEdit.title')} - ${t('brandName')}`,
    description: t('pages.identificationTypeEdit.description'),
  };
}

const EditIdentificationTypePage: FC<EditIdentificationTypePageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.IDENTIFICATION_TYPE.EDIT]);
  
  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/security/identification-types', params: { tenantId } } });
  }

  const t = await getTranslations('admin.identificationType.form');

  const db = await getDb();
  const defaultValues = await db.identificationType.findFirst({
    where: { id: slug, tenantId },
    select: { id: true, name: true, description: true, regex: true },
  });

  if (!defaultValues) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/security/identification-types', params: { tenantId } } });
  }

  return (
    <PageCardWrapper title={t('editIdentificationType')} description={t('editIdentificationTypeDescription')}>
      <IdentificationTypeForm tenantId={tenantId} defaultValues={{ ...defaultValues, description: defaultValues.description ?? undefined, regex: defaultValues.regex ?? undefined }} />
    </PageCardWrapper>
  );
};

export default EditIdentificationTypePage;
