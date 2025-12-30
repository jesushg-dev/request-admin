import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getCurrentUserTenant } from '@/actions/user';
import { env } from '@/env';
import { redirect } from '@/i18n/routing';
import { auth, currentSession, getActiveTenantId } from '@/server/auth-server';
import { getDb } from '@/server/db-client';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { LoginErrorCodeEnum } from '@/types/user';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ClipboardProvider } from '@/components/hoc/clipboard-context';
import { TenantProvider } from '@/components/hoc/tenant-provider';
import { TenantThemeProvider } from '@/components/hoc/tenant-theme-provider';
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

/**
 * Tenant layout with authentication and authorization
 * 
 * Handles:
 * - Real session validation (authentication)
 * - Tenant access validation (authorization)
 * - Setting activeOrganization based on URL tenantId
 * - Redirecting if user doesn't have access
 */
export default async function RootLayout({
  params,
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ tenantId: string, locale: Locale }>;
}>) {
  const { tenantId, locale } = await params;
  
  // REAL AUTHENTICATION CHECK: Validate session properly
  const session = await currentSession();
  if (!session) {
    return redirect({ href: '/auth/login', locale });
  }

  // REAL AUTHORIZATION CHECK: Validate user has access to this tenant
  const userTenant = await getCurrentUserTenant(tenantId);
  if (!userTenant) {
    console.warn(`User with ID ${session.user.id} does not have access to tenant ${tenantId}`);
    return redirect({ 
      href: { 
        pathname: '/auth/login', 
        query: { error: LoginErrorCodeEnum.TENANT_NOT_AUTHORIZED } 
      }, 
      locale
    });
  }

  // Set activeOrganization to match the URL tenantId
  // This ensures that queries without explicit tenantId filter by the correct tenant
  const currentActiveTenantId = await getActiveTenantId();
  if (currentActiveTenantId !== tenantId) {
    try {
      await auth.api.setActiveOrganization({
        body: {
          organizationId: tenantId,
        },
        headers: await headers(),
      });
    } catch (error) {
      console.error('Error setting active organization:', error);
      // If setting fails, redirect to /admin to let the page handle it
      return redirect({ href: '/admin', locale: locale });
    }
  }

  const db = await getDb();
  const tenants = await db.tenant.findMany({
    select: { 
      id: true, 
      name: true, 
      description: true, 
      logo: true, 
      uploadStorageType: true,
      primaryColor: true,
      secondaryColor: true,
      themeColors: true,
    },
    where: { userTenants: { some: { userId: { equals: session.user.id } } } },
  });

  const menuItems = await db.menuItem.findMany({
    where: { tenantId },
  });

  return (
    <TenantProvider tenantId={tenantId} userTenant={userTenant} tenants={tenants}>
      <TenantThemeProvider>
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
      </TenantThemeProvider>
    </TenantProvider>
  );
}
