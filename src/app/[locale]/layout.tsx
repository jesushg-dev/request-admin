import '@/styles/globals.css';
import { type Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { TRPCReactProvider } from '@/trpc/react';
import { ThemeProvider } from 'next-themes';

import localFont from 'next/font/local';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Locale, routing } from '@/i18n/routing';

import { auth } from '@/server/auth';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from '@/components/ui/sonner';
import { ToastContainer } from 'react-toastify';

// Font configuration
const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

// Metadata configuration with localization support
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'home' });

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
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <NextTopLoader />
              <Toaster />
              <ToastContainer />
              <TRPCReactProvider>{children}</TRPCReactProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
