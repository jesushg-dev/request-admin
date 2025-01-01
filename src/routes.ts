export type LoginError = 'unauthenticated' | 'tenant';

/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes: string[] = ['/', '/auth/*', '/about/*', '*/api/auth/*'];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes: string = '/auth/*';

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix: string = '/api/auth';

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT: '/admin' = '/admin' as const;

export const isPublicPage = (pathname: string, locales: readonly string[]): boolean => {
  const publicRoutesWithLocaleRegex = RegExp(`^/(${locales.join('|')})(${publicRoutes.flatMap((p) => (p === '/' ? ['', '/'] : p.replace('*', '.*'))).join('|')})/?$`, 'i');
  const publicRoutesWithoutLocaleRegex = RegExp(`^(${publicRoutes.flatMap((p) => (p === '/' ? ['', '/'] : p.replace('*', '.*'))).join('|')})/?$`, 'i');
  const result1 = publicRoutesWithLocaleRegex.test(pathname);
  const result2 = publicRoutesWithoutLocaleRegex.test(pathname);
  if (pathname === '/es/api/auth/session' || pathname === '/api/auth/session') {
    return true;
  }
  return result1 || result2;
};
