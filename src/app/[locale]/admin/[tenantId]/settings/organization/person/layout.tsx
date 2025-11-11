import { type Metadata } from 'next';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(props: { params: Promise<{ locale: string; tenantId: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.organizationPerson.title')} - ${t('brandName')}`,
    description: t('pages.organizationPerson.description'),
  };
}

export default function OrganizationPersonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

