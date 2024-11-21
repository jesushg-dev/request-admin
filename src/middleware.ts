import { type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { auth } from './server/auth';
import { locales, routing } from './i18n/routing';
import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from './routes';

const publicPages = ['/', '/auth/*'];

const intlMiddleware = createIntlMiddleware(routing);

const authMiddleware = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) return;

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }

  if (isLoggedIn) {
    return intlMiddleware(req);
  }
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};

export default function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(`^(/(${locales.join('|')}))?((${publicPages.flatMap((p) => (p === '/' ? ['', '/'] : p.replace('*', '.*'))).join('|')}))/?$`, 'i');
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    return (authMiddleware as any)(req);
  }
}
