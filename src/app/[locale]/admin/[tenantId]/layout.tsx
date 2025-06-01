import type { Metadata } from 'next';
import { redirect } from '@/i18n/routing';
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { SidebarProvider } from '@/components/ui/sidebar';
import { ClipboardProvider } from '@/components/hoc/clipboard-context';
import { TenantProvider } from '@/components/hoc/tenant-provider';
import { AppSidebar } from '@/components/layouts/admin/app-sidebar';
import { DndSubmissionProvider } from '@/components/layouts/admin/dnd-submission-provider';
import { Navbar } from '@/components/layouts/admin/nav-bar';
import NotificationProvider from '@/components/notification/notification-context';

export async function generateMetadata(props: { params: { locale: Locale } }): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return {
    title: t('title'),
    description: t('description'),
    applicationName: t('applicationName'),
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
    authors: [
      {
        name: 'Jesús Hernández',
        url: 'https://www.jesushg.com',
      },
      {
        name: 'Danilo Acevedo',
        url: 'https://www.daniloacevedo.com',
      },
    ],
    keywords: t('keywords'),
  };
}

export default async function RootLayout({
  params,
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ tenantId: string }>;
}>) {
  const { tenantId } = await params;
  const session = await currentSession();
  if (!session) return redirect({ href: '/', locale: 'en' });

  const tenants = await db.tenant.findMany({
    select: { id: true, name: true, description: true, logo: true },
    where: { userTenants: { some: { userId: { equals: session.user.id } } } },
  });

  const userTenantId = await db.userTenant.findFirst({
    select: { id: true },
    where: { userId: session.user.id, tenantId },
  });
  if (!userTenantId) {
    console.warn(`User with ID ${session.user.id} does not have access to tenant ${tenantId}`);
    return redirect({ href: '/', locale: 'en' });
  }

  const menuItems = await db.menuItem.findMany({
    where: { tenantId },
  });

  return (
    <TenantProvider tenantId={tenantId} userTenantId={userTenantId.id}>
      <SidebarProvider>
        <DndSubmissionProvider tenantId={tenantId} data={menuItems}>
          <AppSidebar tenants={tenants} user={session.user} tenantId={tenantId} />
          <main className="flex h-screen w-full flex-1 flex-col overflow-hidden">
            <ClipboardProvider>
              <NotificationProvider tenantId={tenantId} userTenantId={userTenantId.id}>
                <Navbar tenants={tenants} />
                <div className="flex flex-1 overflow-hidden">
                  {children}
                  {modal}
                </div>
              </NotificationProvider>
            </ClipboardProvider>
          </main>
        </DndSubmissionProvider>
      </SidebarProvider>
    </TenantProvider>
  );
}
