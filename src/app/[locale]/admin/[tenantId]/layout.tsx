import type { Metadata } from 'next';
import { redirect } from '@/i18n/routing';
import { auth } from '@/server/auth';
import { db } from '@/server/db-server';
import { getTranslations } from 'next-intl/server';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layouts/admin/app-sidebar';
import { ModeToggle } from '@/components/layouts/admin/mode-toggle';

export async function generateMetadata(props: { params: { locale: string } }): Promise<Metadata> {
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
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) return redirect({ href: '/', locale: 'en' });

  const tenants = await db.tenant.findMany({
    select: { id: true, name: true, description: true, logoUrl: true },
    where: { userTenants: { some: { userId: { equals: session.user.id } } } },
  });

  return (
    <SidebarProvider>
      <AppSidebar tenants={tenants} user={session.user} />
      <main className="flex h-screen w-full flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <ModeToggle />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
