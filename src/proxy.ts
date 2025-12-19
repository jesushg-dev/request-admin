import { type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import createIntlMiddleware from 'next-intl/middleware';

import { locales, routing } from './i18n/routing';
import { authRoutes, DEFAULT_LOGIN_REDIRECT, isPublicPage } from './routes';

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
  // Exclude API routes to avoid infinite loops and allow API key authentication
  matcher: [
    // Match all routes except static files, _next, and all api routes
    '/((?!.+\\.[\\w]+$|_next|api).*)',
    '/',
  ],
};

/**
 * Proxy function for Next.js 16+
 * 
 * SECURITY WARNING: This proxy only does optimistic cookie-based checks for redirects.
 * It does NOT validate the session or perform database queries.
 * 
 * Real authentication/authorization must be handled in each page/route using:
 * - auth.api.getSession() in server components
 * - Proper session validation before accessing protected resources
 * 
 * This follows Better Auth's recommended approach to avoid blocking requests
 * with expensive database calls in middleware/proxy.
 */
export default async function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api/uploadthing')) {
    return;
  }

  // Public pages don't need authentication checks
  if (isPublicPage(req.nextUrl.pathname, locales)) {
    return intlMiddleware(req);
  }

  // OPTIMISTIC CHECK: Only check for session cookie existence
  // This is NOT secure - real validation happens in pages/layouts
  // We use this only for optimistic redirects to improve UX
  const sessionCookie = getSessionCookie(req);

  if (!sessionCookie) {
    // No session cookie - redirect to login
    let callbackUrl = req.nextUrl.pathname + (req.nextUrl.search || '');
    // Validate callbackUrl
    if (!isSafeCallbackUrl(callbackUrl)) {
      callbackUrl = '/';
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    // Check if the path is for invitation acceptance
    const isAcceptInvitation = /\/admin\/global\/tenants\/accept-invitation/.test(req.nextUrl.pathname);
    const errorType = isAcceptInvitation ? 'INVITATION_REQUIRED_AUTH' : 'UNAUTHENTICATED';

    return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}&error=${errorType}`, req.nextUrl));
  }

  // Redirect to default login redirect if the user is trying to access an auth route while logged in
  // This is also optimistic - real validation happens in auth pages
  if (new RegExp(`^${authRoutes.replace('*', '.*')}$`).test(req.nextUrl.pathname)) {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.nextUrl));
  }

  // All other authentication/authorization logic (tenant validation, activeOrganization, etc.)
  // is handled in the respective layouts and pages where we can properly validate sessions
  // and perform database queries safely.

  return intlMiddleware(req);
}
