import { type Metadata } from 'next';
import { getCurrentUserTenant } from '@/actions/user';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import NotificationProvider from '@/components/notification/notification-context';

export async function generateMetadata(props: { params: Promise<{ locale: string; tenantId: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.notifications.title')} - ${t('brandName')}`,
    description: t('pages.notifications.description'),
  };
}

export default async function NotificationsLayout({ children, params }: { children: React.ReactNode; params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const userTenant = await getCurrentUserTenant(tenantId);

  return (
    <NotificationProvider tenantId={tenantId} userTenantId={userTenant.userTenantId}>
      {children}
    </NotificationProvider>
  );
}
