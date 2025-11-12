import localFont from 'next/font/local';
import { Lexend } from 'next/font/google';

// Geist Sans font
export const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

// Geist Mono font
export const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

// Lexend font from Google Fonts
export const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

// OpenDyslexic font (local)
export const openDyslexic = localFont({
  src: [
    {
      path: './fonts/OpenDyslexic-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/OpenDyslexic-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/OpenDyslexic-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/OpenDyslexic-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-open-dyslexic',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

