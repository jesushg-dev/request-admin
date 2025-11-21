import { type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { locales, routing } from './i18n/routing';
import { getTenantsForUser, validateTenantId } from './lib/tenant';
import { extractTenantId } from './lib/utils';
import { authRoutes, DEFAULT_LOGIN_REDIRECT, isPublicPage } from './routes';
import { auth } from './server/auth-server';
import { LoginErrorCodeEnum } from './types/user';

const intlMiddleware = createIntlMiddleware(routing);

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || '';

function isSafeCallbackUrl(url: string) {
  try {
    // Allow only relative URLs or absolute URLs that start with your domain
    if (url.startsWith('/')) return true;
    const parsed = new URL(url, BETTER_AUTH_URL);
    return parsed.origin === BETTER_AUTH_URL.replace(/\/$/, '');
  } catch {
    return false;
  }
}

// comment: locate this code in your middleware config file (e.g., middleware.ts or middleware.js)
export const config = {
  // Exclude API routes for tenants to avoid infinite loops, since we now use DB directly
  matcher: [
    // Match all routes except static files, _next, api/auth, and api/tenants
    '/((?!.+\\.[\\w]+$|_next|api/auth|api/tenants).*)',
    '/',
  ],
};

export default async function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api/uploadthing')) {
    return;
  }

  if (isPublicPage(req.nextUrl.pathname, locales)) {
    return intlMiddleware(req);
  }

  // Use auth.api.getSession directly instead of HTTP call to avoid duplicate queries
  // Convert NextRequest headers to Headers that Better Auth can use
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    headers.set(key, value);
  });

  const session = await auth.api.getSession({
    headers,
  });

  if (!session) {
    let callbackUrl = req.nextUrl.pathname + (req.nextUrl.search || '');
    // Validate callbackUrl
    if (!isSafeCallbackUrl(callbackUrl)) {
      callbackUrl = '/';
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    // Check if the path is for invitation acceptance
    const isAcceptInvitation = /\/admin\/global\/tenants\/accept-invitation/.test(req.nextUrl.pathname);

    const errorType = isAcceptInvitation ? LoginErrorCodeEnum.INVITATION_REQUIRED_AUTH : LoginErrorCodeEnum.UNAUTHENTICATED;

    return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}&error=${errorType}`, req.nextUrl));
  }

  // Redirect to default login redirect if the user is trying to access an auth route while logged in
  if (new RegExp(`^${authRoutes.replace('*', '.*')}$`).test(req.nextUrl.pathname)) {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.nextUrl));
  }

  // If the user is accessing the main tenants page ("/admin" or locale variant)
  // and is NOT in the process of accepting a tenant invitation,
  // redirect them based on their tenant access:
  // - If the user has no tenants, redirect to the tenant creation page.
  // - If the user has exactly one tenant, redirect directly to that tenant's admin page.
  const isAcceptInvitation = /\/admin\/global\/tenants\/accept-invitation/.test(req.nextUrl.pathname);
  if ((new RegExp(`^/(${locales.join('|')})?/admin(/)?$`).test(req.nextUrl.pathname) || /^\/admin\/?$/.test(req.nextUrl.pathname)) && !isAcceptInvitation) {
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
    const isValid = await validateTenantId(tenantId, session.user.id);
    if (!isValid) {
      const encodedCallbackUrl = encodeURIComponent(req.nextUrl.pathname);
      return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}&error=${LoginErrorCodeEnum.TENANT_NOT_AUTHORIZED}`, req.nextUrl));
    }
  }

  return intlMiddleware(req);
}
