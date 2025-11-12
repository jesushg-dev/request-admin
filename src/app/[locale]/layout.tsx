import { type Metadata } from 'next';
import localFont from 'next/font/local';
import { Lexend } from 'next/font/google';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { NextIntlClientProvider, type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { Toaster } from '@/components/ui/sonner';
import { ConfirmDialogProvider } from '@/components/custom-ui/confirm-dialog';
import TanstackQueryProvider from '@/components/hoc/tanstack-query-provider';
import { FontProvider } from '@/components/hoc/font-provider';

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

// Lexend font from Google Fonts
const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

// OpenDyslexic font (local - requires font files in src/app/fonts/)
const openDyslexic = localFont({
  src: [
    {
      path: '../fonts/OpenDyslexic-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/OpenDyslexic-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/OpenDyslexic-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/OpenDyslexic-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-open-dyslexic',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

// Metadata configuration with localization support
export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'home' });

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
  const { locale } = await params;

  // Validate the incoming locale
  const validLocale = locale as Locale;
  if (!routing.locales.includes(validLocale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body id="body" className={`${geistSans.variable} ${geistMono.variable} ${lexend.variable} ${openDyslexic.variable} flex min-h-screen flex-col antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <FontProvider>
            <NextIntlClientProvider locale={locale as Locale}>
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
