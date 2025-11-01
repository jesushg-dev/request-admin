import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { getSecurityStats } from '@/actions/security';
import { SecurityDashboardClient } from '@/components/common/security/security-dashboard-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin.security.dashboard');
  
  return {
    title: t('title'),
    description: t('description'),
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
