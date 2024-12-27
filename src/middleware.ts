import { type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { locales, routing } from './i18n/routing';
import { getTenantsForUser, validateTenantId } from './lib/tenant';
import { extractTenantId } from './lib/utils';
import { authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from './routes';
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

    return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
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

  // Redirect to 404 if the tenant ID is invalid in the URL path (non located)
  const tenantId = extractTenantId(nextUrl.pathname, locales);
  if (tenantId) {
    const isValid = await validateTenantId(tenantId);
    if (!isValid) {
      return new Response(null, { status: 403 });
    }
  }

  return intlMiddleware(req);
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};

export default function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(`^(/(${locales.join('|')}))?((${publicRoutes.flatMap((p) => (p === '/' ? ['', '/'] : p.replace('*', '.*'))).join('|')}))/?$`, 'i');
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    return (authMiddleware as any)(req);
  }
}
