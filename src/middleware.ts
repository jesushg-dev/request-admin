import { type NextRequest } from 'next/server';
import { betterFetch } from '@better-fetch/fetch';
import createIntlMiddleware from 'next-intl/middleware';

import { locales, routing } from './i18n/routing';
import { getTenantsForUser, validateTenantId } from './lib/tenant';
import { extractTenantId } from './lib/utils';
import { authRoutes, DEFAULT_LOGIN_REDIRECT, isPublicPage } from './routes';
import { auth } from './server/auth-server';

type Session = typeof auth.$Infer.Session;

const intlMiddleware = createIntlMiddleware(routing);

// comment: locate this code in your middleware config file (e.g., middleware.ts or middleware.js)
export const config = {
  // Only run the middleware on pages that shouldn't include /api/auth
  // for example, everything except /api/auth or _next
  matcher: ['/((?!.+\\.[\\w]+$|_next|api/auth).*)', '/', '/(api)(.*)'],
};

export default async function middleware(req: NextRequest) {
  //if (req.nextUrl.pathname === '/es/api/auth/get-session') {
  //  return Response.redirect(new URL('/api/auth/get-session', req.nextUrl));
  //}

  if (isPublicPage(req.nextUrl.pathname, locales)) {
    return intlMiddleware(req);
  }

  // Redirect to login if not authenticated with a callback URL to return to the current page after login
  const { data: session } = await betterFetch<Session>('/api/auth/get-session', {
    baseURL: req.nextUrl.origin,
    headers: {
      cookie: req.headers.get('cookie') || '', // Forward the cookies from the request
    },
  });

  if (!session) {
    let callbackUrl = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      callbackUrl += req.nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}&error=unauthenticated`, req.nextUrl));
  }

  // Redirect to default login redirect if the user is trying to access an auth route while logged in
  if (new RegExp(`^${authRoutes.replace('*', '.*')}$`).test(req.nextUrl.pathname)) {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.nextUrl));
  }

  // Redirect to the tenant admin page if the user is trying to access the tenants page
  // and the user only has access to one tenant
  if (new RegExp(`^/(${locales.join('|')})?/admin(/)?$`).test(req.nextUrl.pathname) || /^\/admin\/?$/.test(req.nextUrl.pathname)) {
    const tenants = await getTenantsForUser(session.user.id);
    if (tenants.length === 0) {
      return Response.redirect(new URL('/admin/global/tenants/new', req.nextUrl));
    }

    if (tenants.length === 1) {
      return Response.redirect(new URL(`/admin/${tenants[0].id}`, req.nextUrl));
    }
  }

  // Redirect to login if the user is trying to access a tenant page without being a member of that tenant
  const tenantId = extractTenantId(req.nextUrl.pathname, locales);
  if (tenantId) {
    const isValid = await validateTenantId(tenantId);
    if (!isValid) {
      const encodedCallbackUrl = encodeURIComponent(req.nextUrl.pathname);
      return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}&error=tenant`, req.nextUrl));
    }
  }

  return intlMiddleware(req);
}
