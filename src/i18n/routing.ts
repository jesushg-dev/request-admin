import { createNavigation } from 'next-intl/navigation';
import { defineRouting, Pathnames } from 'next-intl/routing';

export type Locale = 'en' | 'es';
export const defaultLocale = 'en';
export const locales = ['en', 'es'] as const;
export const localePrefix = process.env.NEXT_PUBLIC_LOCALE_PREFIX === 'never' ? 'never' : 'as-needed';

const basePathnames = {
  '/': {
    en: '/',
    es: '/',
  },
  '/admin': {
    en: '/admin',
    es: '/admin',
  },
  '/admin/[tenantId]': {
    en: '/admin/[tenantId]',
    es: '/admin/[tenantId]',
  },
} satisfies Pathnames<Locale[]>;

const securityPathnames = {
  // security
  '/admin/[tenantId]/security': {
    en: '/admin/[tenantId]/security',
    es: '/admin/[tenantId]/seguridad',
  },
  // roles
  '/admin/[tenantId]/security/roles': {
    en: '/admin/[tenantId]/security/roles',
    es: '/admin/[tenantId]/seguridad/roles',
  },
  '/admin/[tenantId]/security/roles/new': {
    en: '/admin/[tenantId]/security/roles/new',
    es: '/admin/[tenantId]/seguridad/roles/nuevo',
  },
  '/admin/[tenantId]/security/roles/[slug]': {
    en: '/admin/[tenantId]/security/roles/[slug]',
    es: '/admin/[tenantId]/seguridad/roles/[slug]',
  },
  '/admin/[tenantId]/security/roles/[slug]/edit': {
    en: '/admin/[tenantId]/security/roles/[slug]/edit',
    es: '/admin/[tenantId]/seguridad/roles/[slug]/editar',
  },
  // users
  '/admin/[tenantId]/security/users': {
    en: '/admin/[tenantId]/security/users',
    es: '/admin/[tenantId]/seguridad/usuarios',
  },
  '/admin/[tenantId]/security/users/new': {
    en: '/admin/[tenantId]/security/users/new',
    es: '/admin/[tenantId]/seguridad/usuarios/nuevo',
  },
  '/admin/[tenantId]/security/users/[slug]': {
    en: '/admin/[tenantId]/security/users/[slug]',
    es: '/admin/[tenantId]/seguridad/usuarios/[slug]',
  },
  '/admin/[tenantId]/security/users/[slug]/edit': {
    en: '/admin/[tenantId]/security/users/[slug]/edit',
    es: '/admin/[tenantId]/seguridad/usuarios/[slug]/editar',
  },
} satisfies Pathnames<Locale[]>;

const managementPathnames = {
  // areas
  '/admin/[tenantId]/management/areas': {
    en: '/admin/[tenantId]/management/areas',
    es: '/admin/[tenantId]/gestion/areas',
  },
  '/admin/[tenantId]/management/areas/new': {
    en: '/admin/[tenantId]/management/areas/new',
    es: '/admin/[tenantId]/gestion/areas/nuevo',
  },
  '/admin/[tenantId]/management/areas/[slug]': {
    en: '/admin/[tenantId]/management/areas/[slug]',
    es: '/admin/[tenantId]/gestion/areas/[slug]',
  },
  '/admin/[tenantId]/management/areas/[slug]/edit': {
    en: '/admin/[tenantId]/management/areas/[slug]/edit',
    es: '/admin/[tenantId]/gestion/areas/[slug]/editar',
  },
  // clients
  '/admin/[tenantId]/management/clients': {
    en: '/admin/[tenantId]/management/clients',
    es: '/admin/[tenantId]/gestion/clientes',
  },
  '/admin/[tenantId]/management/clients/new': {
    en: '/admin/[tenantId]/management/clients/new',
    es: '/admin/[tenantId]/gestion/clientes/nuevo',
  },
  '/admin/[tenantId]/management/clients/[slug]': {
    en: '/admin/[tenantId]/management/clients/[slug]',
    es: '/admin/[tenantId]/gestion/clientes/[slug]',
  },
  '/admin/[tenantId]/management/clients/[slug]/edit': {
    en: '/admin/[tenantId]/management/clients/[slug]/edit',
    es: '/admin/[tenantId]/gestion/clientes/[slug]/editar',
  },
  // hierarchies
  '/admin/[tenantId]/management/hierarchies': {
    en: '/admin/[tenantId]/management/hierarchies',
    es: '/admin/[tenantId]/gestion/jerarquias',
  },
  '/admin/[tenantId]/management/hierarchies/new': {
    en: '/admin/[tenantId]/management/hierarchies/new',
    es: '/admin/[tenantId]/gestion/jerarquias/nuevo',
  },
  '/admin/[tenantId]/management/hierarchies/[slug]': {
    en: '/admin/[tenantId]/management/hierarchies/[slug]',
    es: '/admin/[tenantId]/gestion/jerarquias/[slug]',
  },
  '/admin/[tenantId]/management/hierarchies/[slug]/edit': {
    en: '/admin/[tenantId]/management/hierarchies/[slug]/edit',
    es: '/admin/[tenantId]/gestion/jerarquias/[slug]/editar',
  },
  // identification types
  '/admin/[tenantId]/management/identification-types': {
    en: '/admin/[tenantId]/management/identification-types',
    es: '/admin/[tenantId]/gestion/tipos-de-identificacion',
  },
} satisfies Pathnames<Locale[]>;

const requestsPathnames = {
  '/admin/[tenantId]/requests-portal/requests': {
    en: '/admin/[tenantId]/requests-portal/requests',
    es: '/admin/[tenantId]/solicitudes-portal/solicitudes',
  },
  '/admin/[tenantId]/requests-portal/requests/new': {
    en: '/admin/[tenantId]/requests-portal/requests/new',
    es: '/admin/[tenantId]/solicitudes-portal/solicitudes/nuevo',
  },
  '/admin/[tenantId]/requests-portal/requests/[slug]': {
    en: '/admin/[tenantId]/requests-portal/requests/[slug]',
    es: '/admin/[tenantId]/solicitudes-portal/solicitudes/[slug]',
  },
  '/admin/[tenantId]/requests-portal/requests/[slug]/edit': {
    en: '/admin/[tenantId]/requests-portal/requests/[slug]/edit',
    es: '/admin/[tenantId]/solicitudes-portal/solicitudes/[slug]/editar',
  },
  // Request types
  '/admin/[tenantId]/requests-portal/request-types': {
    en: '/admin/[tenantId]/requests-portal/request-types',
    es: '/admin/[tenantId]/solicitudes-portal/tipo-de-solicitudes',
  },
  '/admin/[tenantId]/requests-portal/request-types/new': {
    en: '/admin/[tenantId]/requests-portal/request-types/new',
    es: '/admin/[tenantId]/solicitudes-portal/tipo-de-solicitudes/nuevo',
  },
  '/admin/[tenantId]/requests-portal/request-types/[slug]': {
    en: '/admin/[tenantId]/requests-portal/request-types/[slug]',
    es: '/admin/[tenantId]/solicitudes-portal/tipo-de-solicitudes/[slug]',
  },
  '/admin/[tenantId]/requests-portal/request-types/[slug]/edit': {
    en: '/admin/[tenantId]/requests-portal/request-types/[slug]/edit',
    es: '/admin/[tenantId]/solicitudes-portal/tipo-de-solicitudes/[slug]/editar',
  },
  // Requirements
  '/admin/[tenantId]/requests-portal/requirements': {
    en: '/admin/[tenantId]/requests-portal/requirements',
    es: '/admin/[tenantId]/solicitudes-portal/requisitos',
  },
  '/admin/[tenantId]/requests-portal/requirements/new': {
    en: '/admin/[tenantId]/requests-portal/requirements/new',
    es: '/admin/[tenantId]/solicitudes-portal/requisitos/nuevo',
  },
  '/admin/[tenantId]/requests-portal/requirements/[slug]': {
    en: '/admin/[tenantId]/requests-portal/requirements/[slug]',
    es: '/admin/[tenantId]/solicitudes-portal/requisitos/[slug]',
  },
  '/admin/[tenantId]/requests-portal/requirements/[slug]/edit': {
    en: '/admin/[tenantId]/requests-portal/requirements/[slug]/edit',
    es: '/admin/[tenantId]/solicitudes-portal/requisitos/[slug]/editar',
  },
  // Documents
  '/admin/[tenantId]/requests-portal/documents': {
    en: '/admin/[tenantId]/requests-portal/documents',
    es: '/admin/[tenantId]/solicitudes-portal/documentos',
  },
  '/admin/[tenantId]/requests-portal/documents/new': {
    en: '/admin/[tenantId]/requests-portal/documents/new',
    es: '/admin/[tenantId]/solicitudes-portal/documentos/nuevo',
  },
  '/admin/[tenantId]/requests-portal/documents/[slug]': {
    en: '/admin/[tenantId]/requests-portal/documents/[slug]',
    es: '/admin/[tenantId]/solicitudes-portal/documentos/[slug]',
  },
  '/admin/[tenantId]/requests-portal/documents/[slug]/edit': {
    en: '/admin/[tenantId]/requests-portal/documents/[slug]/edit',
    es: '/admin/[tenantId]/solicitudes-portal/documentos/[slug]/editar',
  },
} satisfies Pathnames<Locale[]>;

const formsPathnames = {
  // form designer
  '/admin/[tenantId]/form-designer': {
    en: '/admin/[tenantId]/form-designer',
    es: '/admin/[tenantId]/disenador-de-formularios',
  },
  '/admin/[tenantId]/form-designer/[slug]': {
    en: '/admin/[tenantId]/form-designer/[slug]',
    es: '/admin/[tenantId]/disenador-de-formularios/[slug]',
  },
  '/admin/[tenantId]/form-designer/[slug]/edit': {
    en: '/admin/[tenantId]/form-designer/[slug]/edit',
    es: '/admin/[tenantId]/disenador-de-formularios/[slug]/editar',
  },
} satisfies Pathnames<Locale[]>;

const settingsPathnames = {
  // settings
  '/admin/[tenantId]/settings': {
    en: '/admin/[tenantId]/settings',
    es: '/admin/[tenantId]/configuracion',
  },
  '/admin/[tenantId]/settings/account': {
    en: '/admin/[tenantId]/settings/account',
    es: '/admin/[tenantId]/configuracion/cuenta',
  },
  '/admin/[tenantId]/settings/smtp': {
    en: '/admin/[tenantId]/settings/smtp',
    es: '/admin/[tenantId]/configuracion/smtp',
  },
  '/admin/[tenantId]/settings/credit-card': {
    en: '/admin/[tenantId]/settings/credit-card',
    es: '/admin/[tenantId]/configuracion/tarjeta-de-credito',
  },
  '/admin/[tenantId]/settings/social': {
    en: '/admin/[tenantId]/settings/social',
    es: '/admin/[tenantId]/configuracion/redes-sociales',
  },
  '/admin/[tenantId]/settings/tenant': {
    en: '/admin/[tenantId]/settings/tenant',
    es: '/admin/[tenantId]/configuracion/inquilino',
  },
} satisfies Pathnames<Locale[]>;

const globalPathnames = {
  // tenants
  '/admin/global': {
    en: '/admin/global',
    es: '/admin/global',
  },
  '/admin/global/tenants': {
    en: '/admin/global/tenants',
    es: '/admin/global/inquilinos',
  },
  '/admin/global/tenants/new': {
    en: '/admin/global/tenants/new',
    es: '/admin/global/inquilinos/nuevo',
  },
  '/admin/global/tenants/[slug]': {
    en: '/admin/global/tenants/[slug]',
    es: '/admin/global/inquilinos/[slug]',
  },
  '/admin/global/tenants/[slug]/edit': {
    en: '/admin/global/tenants/[slug]/edit',
    es: '/admin/global/inquilinos/[slug]/editar',
  },
  // plans
  '/admin/global/plans': {
    en: '/admin/global/plans',
    es: '/admin/global/planes',
  },
  '/admin/global/plans/new': {
    en: '/admin/global/plans/new',
    es: '/admin/global/planes/nuevo',
  },
  '/admin/global/plans/[slug]': {
    en: '/admin/global/plans/[slug]',
    es: '/admin/global/planes/[slug]',
  },
  '/admin/global/plans/[slug]/edit': {
    en: '/admin/global/plans/[slug]/edit',
    es: '/admin/global/planes/[slug]/editar',
  },
} satisfies Pathnames<Locale[]>;

export const pathnames = {
  ...basePathnames,
  ...securityPathnames,
  ...managementPathnames,
  ...requestsPathnames,
  ...formsPathnames,
  ...settingsPathnames,
  ...globalPathnames,
} satisfies Pathnames<Locale[]>;

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',

  // Used to determine the locale prefix
  localePrefix,

  // The pathnames for each page
  pathnames,
});

export const getSiblingRoutes = (currentRoute: string, locale: Locale, ignoreCurrent = true): string[] => {
  // Extract the base path by removing the last segment
  const basePath = currentRoute.replace(/\/[^/]+$/, '');
  const segmentCount = currentRoute.split('/').length;

  // Find all siblings with the same number of segments
  const siblingKeys = Object.keys(pathnames).filter((path) => {
    const isSibling =
      path.startsWith(basePath + '/') && // Same base path
      path.split('/').length === segmentCount && // Same number of segments
      (ignoreCurrent ? path !== currentRoute : true); // Ignore the current route
    return isSibling;
  });

  // Map sibling keys to their localized values
  return siblingKeys.map((key) => {
    const path = pathnames[key as keyof typeof pathnames];
    if (path && typeof path === 'object' && locale in path) {
      return path[locale];
    }
    return '';
  });
};

export const IsExistingRoute = (currentRoute: string): boolean => {
  return currentRoute in pathnames;
};

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
