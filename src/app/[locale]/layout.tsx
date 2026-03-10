import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { Toaster } from '@/components/ui/sonner';
import { ConfirmDialogProvider } from '@/components/custom-ui/confirm-dialog';
import { FontProvider } from '@/components/hoc/font-provider';
import TanstackQueryProvider from '@/components/hoc/tanstack-query-provider';

import { geistMono, geistSans, lexend } from '../fonts';

// Metadata configuration with localization support
export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const locale = hasLocale(routing.locales, params.locale) ? params.locale : routing.defaultLocale;
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
  params: Promise<{ locale: string }>;
};

// RootLayout component
export default async function RootLayout({ children, params }: Props) {
  const { locale: localeParam } = await params;

  // Validate the incoming locale
  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }
  const locale = localeParam;

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body id="body" className={`${geistSans.variable} ${geistMono.variable} ${lexend.variable} flex min-h-screen flex-col antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <FontProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <NextTopLoader />
              <TanstackQueryProvider>
                <NuqsAdapter>
                  <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
                </NuqsAdapter>
                <Toaster position="top-right" closeButton />
              </TanstackQueryProvider>
            </NextIntlClientProvider>
          </FontProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
