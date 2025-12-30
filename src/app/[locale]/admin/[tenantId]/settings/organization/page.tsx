import { FC } from 'react';
import { type Metadata } from 'next';
import { getTenantInformation } from '@/actions/tenant';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { FeatureFlagsManager } from '@/components/common/organization/feature-flags-manager';
import TenantForm from '@/components/common/tenant/tenant-form';
import { ThemeColorsForm } from '@/components/common/tenant/theme-colors-form';

interface EditPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

export async function generateMetadata(props: EditPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.organization.title')} - ${t('brandName')}`,
    description: t('pages.organization.description'),
  };
}

const EditPage: FC<EditPageProps> = async ({ params }) => {
  const { tenantId } = await params;
  const organization = await getTenantInformation(tenantId);

  return (
    <div className="space-y-6">
      <TenantForm
        defaultValues={{
          values: organization,
          organizationId: tenantId,
        }}
      />
      <ThemeColorsForm initialThemeColors={organization.themeColors} />
      <FeatureFlagsManager tenantId={tenantId} />
    </div>
  );
};

export default EditPage;
