import { type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { locales, routing } from './i18n/routing';
import { getTenantsForUser, validateTenantId } from './lib/tenant';
import { extractTenantId } from './lib/utils';
import { authRoutes, DEFAULT_LOGIN_REDIRECT, isPublicPage, publicRoutes } from './routes';
import { auth } from './server/auth';

const intlMiddleware = createIntlMiddleware(routing);

const authMiddleware = auth(async (req) => {
  const { nextUrl } = req;

  // Redirect to login if not authenticated with a callback URL to return to the current page after login
  if (!req.auth) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}&error=unauthenticated`, nextUrl));
  }

  // Redirect to default login redirect if the user is trying to access an auth route while logged in
  if (new RegExp(`^${authRoutes.replace('*', '.*')}$`).test(nextUrl.pathname)) {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }

  // Redirect to the tenant admin page if the user is trying to access the tenants page
  // and the user only has access to one tenant
  if (new RegExp(`^/(${locales.join('|')})?/admin(/)?$`).test(nextUrl.pathname) || /^\/admin\/?$/.test(nextUrl.pathname)) {
    const tenants = await getTenantsForUser();
    if (tenants.length === 1) {
      return Response.redirect(new URL(`/admin/${tenants[0].id}`, nextUrl));
    }
  }

  // Redirect to login if the user is trying to access a tenant page without being a member of that tenant
  const tenantId = extractTenantId(nextUrl.pathname, locales);
  if (tenantId) {
    const isValid = await validateTenantId(tenantId);
    if (!isValid) {
      const encodedCallbackUrl = encodeURIComponent(nextUrl.pathname);
      return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}&error=tenant`, nextUrl));
    }
  }

  return intlMiddleware(req);
});

// comment: locate this code in your middleware config file (e.g., middleware.ts or middleware.js)
export const config = {
  // Only run the middleware on pages that shouldn't include /api/auth
  // for example, everything except /api/auth or _next
  matcher: ['/((?!.+\\.[\\w]+$|_next|api/auth).*)', '/', '/(api|trpc)(.*)'],
};

export default function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/es/api/auth/session') {
    return Response.redirect(new URL('/api/auth/session', req.nextUrl));
  }

  if (isPublicPage(req.nextUrl.pathname, locales)) {
    return intlMiddleware(req);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    return (authMiddleware as any)(req);
  }
}
