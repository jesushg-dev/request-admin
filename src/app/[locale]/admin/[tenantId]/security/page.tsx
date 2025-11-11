import { type Metadata } from 'next';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { getSecurityStats } from '@/actions/security';
import { SecurityDashboardClient } from '@/components/common/security/security-dashboard-client';

export async function generateMetadata(props: { params: Promise<{ locale: string; tenantId: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.securityDashboard.title')} - ${t('brandName')}`,
    description: t('pages.securityDashboard.description'),
  };
}

interface SecurityPageProps {
  params: Promise<{
    locale: string;
    tenantId: string;
  }>;
}

export default async function SecurityDashboard({ params }: SecurityPageProps) {
  const { tenantId } = await params;
  const stats = await getSecurityStats(tenantId);

  return <SecurityDashboardClient tenantId={tenantId} initialStats={stats} />;
}
