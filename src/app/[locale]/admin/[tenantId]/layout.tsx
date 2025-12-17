import type { Metadata } from 'next';
import { getCurrentUserTenant } from '@/actions/user';
import { env } from '@/env';
import { redirect } from '@/i18n/routing';
import { currentSession } from '@/server/auth-server';
import { getDb } from '@/server/db-client';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { LoginErrorCodeEnum } from '@/types/user';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ClipboardProvider } from '@/components/hoc/clipboard-context';
import { TenantProvider } from '@/components/hoc/tenant-provider';
import { AppSidebar } from '@/components/layouts/admin/app-sidebar';
import { DndSubmissionProvider } from '@/components/layouts/admin/dnd-submission-provider';
import { Navbar } from '@/components/layouts/admin/nav-bar';

export async function generateMetadata(props: { params: Promise<{ locale: string; tenantId: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });
  const tAdmin = await getTranslations({ locale: locale as Locale, namespace: 'admin' });

  // Default metadata for dashboard (root page)
  return {
    title: `${t('pages.dashboard.title')} - ${t('brandName')}`,
    description: t('pages.dashboard.description'),
    applicationName: tAdmin('applicationName'),
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
    keywords: tAdmin('keywords'),
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

  const db = await getDb();
  const tenants = await db.tenant.findMany({
    select: { id: true, name: true, description: true, logo: true, uploadStorageType: true },
    where: { userTenants: { some: { userId: { equals: session.user.id } } } },
  });

  const userTenant = await getCurrentUserTenant(tenantId);

  if (!userTenant) {
    console.warn(`User with ID ${session.user.id} does not have access to tenant ${tenantId}`);
    return redirect({ href: { pathname: '/auth/login', query: { error: LoginErrorCodeEnum.TENANT_NOT_AUTHORIZED } }, locale: 'en' });
  }

  const menuItems = await db.menuItem.findMany({
    where: { tenantId },
  });

  return (
    <TenantProvider tenantId={tenantId} userTenant={userTenant} tenants={tenants}>
      <SidebarProvider>
        <DndSubmissionProvider tenantId={tenantId} data={menuItems}>
          <AppSidebar user={session.user} isOnPremise={env.ON_PREMISE} />
          <main className="flex h-screen w-full flex-1 flex-col overflow-hidden">
            <ClipboardProvider>
              <Navbar />
              <div className="flex flex-1 overflow-hidden">
                {children}
                {modal}
              </div>
            </ClipboardProvider>
          </main>
        </DndSubmissionProvider>
      </SidebarProvider>
    </TenantProvider>
  );
}
