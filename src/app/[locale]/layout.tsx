import { type Metadata } from 'next';
import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Locale, NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { Toaster } from '@/components/ui/sonner';
import { ConfirmDialogProvider } from '@/components/custom-ui/confirm-dialog';
import TanstackQueryProvider from '@/components/hoc/tanstack-query-provider';

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
export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await props.params;
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
  params: Promise<{ locale: Locale }>;
};

// RootLayout component
export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate the incoming locale
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body id="body" className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider locale={locale}>
            <NextTopLoader />
            <TanstackQueryProvider>
              <NuqsAdapter>
                <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
              </NuqsAdapter>
              <Toaster position="top-right" closeButton />
            </TanstackQueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
