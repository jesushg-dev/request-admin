import type { Metadata } from 'next';

import { AppSidebar } from '@/components/@Admin/Layout/app-sidebar';
import { ModeToggle } from '@/components/@Admin/Layout/mode-toogle';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { getTranslations } from 'next-intl/server';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
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
