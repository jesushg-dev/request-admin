import '@/styles/globals.css';
import { type Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { TRPCReactProvider } from '@/trpc/react';
import { auth } from '@/server/auth';

import { GeistSans } from 'geist/font/sans';
import { Inter } from 'next/font/google';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Locale, routing } from '@/i18n/routing';

import NextTopLoader from 'nextjs-toploader';
import { Toaster } from '@/components/ui/sonner';
import { ToastContainer } from 'react-toastify';

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

// Metadata configuration with localization support
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'LocaleLayout' });

  return {
    metadataBase: new URL('http://localhost:3000'),
    title: t('title'),
    description: t('description'),
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
  };
}

// Enable static generation for all locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Define the component props
type Props = {
  children: React.ReactNode;
  params: { locale: Locale };
};

// RootLayout component
export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate the incoming locale
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const session = await auth();
  const messages = await getMessages();

  return (
    <SessionProvider session={session}>
      <html lang={locale} className={`${GeistSans.variable} ${inter.variable}`}>
        <body data-theme="light" className="font-sans" suppressHydrationWarning>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <NextTopLoader />
            <Toaster />
            <ToastContainer />
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
