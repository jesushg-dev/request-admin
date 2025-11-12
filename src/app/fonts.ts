// import localFont from 'next/font/local';
import { Lexend } from 'next/font/google';

// TODO: Re-enable local fonts when Turbopack bug is fixed in Next.js
// Temporarily disabled due to: "Module not found: Can't resolve 'next/font/local/target.css'"

// Geist Sans font - DISABLED TEMPORARILY
// export const geistSans = localFont({
//   src: './fonts/GeistVF.woff',
//   variable: '--font-geist-sans',
//   weight: '100 900',
// });

// Geist Mono font - DISABLED TEMPORARILY
// export const geistMono = localFont({
//   src: './fonts/GeistMonoVF.woff',
//   variable: '--font-geist-mono',
//   weight: '100 900',
// });

// Lexend font from Google Fonts - WORKING
export const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

// OpenDyslexic font (local) - DISABLED TEMPORARILY
// export const openDyslexic = localFont({
//   src: [
//     {
//       path: './fonts/OpenDyslexic-Regular.woff2',
//       weight: '400',
//       style: 'normal',
//     },
//     {
//       path: './fonts/OpenDyslexic-Bold.woff2',
//       weight: '700',
//       style: 'normal',
//     },
//     {
//       path: './fonts/OpenDyslexic-Italic.woff2',
//       weight: '400',
//       style: 'italic',
//     },
//     {
//       path: './fonts/OpenDyslexic-BoldItalic.woff2',
//       weight: '700',
//       style: 'italic',
//     },
//   ],
//   variable: '--font-open-dyslexic',
//   fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
// });

// Placeholder exports to prevent import errors
export const geistSans = { variable: '' };
export const geistMono = { variable: '' };
export const openDyslexic = { variable: '' };

