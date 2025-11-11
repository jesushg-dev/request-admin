import { type Metadata } from 'next';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(props: { params: Promise<{ locale: string; tenantId: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.account.title')} - ${t('brandName')}`,
    description: t('pages.account.description'),
  };
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

