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
} satisfies Pathnames<typeof locales>;

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
} satisfies Pathnames<typeof locales>;

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
} satisfies Pathnames<typeof locales>;

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
} satisfies Pathnames<typeof locales>;

const formsPathnames = {
  // forms
  '/admin/[tenantId]/forms': {
    en: '/admin/[tenantId]/forms',
    es: '/admin/[tenantId]/formularios',
  },
  '/admin/[tenantId]/forms/new': {
    en: '/admin/[tenantId]/forms/new',
    es: '/admin/[tenantId]/formularios/nuevo',
  },
  '/admin/[tenantId]/forms/[slug]': {
    en: '/admin/[tenantId]/forms/[slug]',
    es: '/admin/[tenantId]/formularios/[slug]',
  },
  // form designer
  '/admin/[tenantId]/form-designer': {
    en: '/admin/[tenantId]/form-designer',
    es: '/admin/[tenantId]/disenador-de-formularios',
  },
} satisfies Pathnames<typeof locales>;

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
} satisfies Pathnames<typeof locales>;

const globalPathnames = {
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
} satisfies Pathnames<typeof locales>;

export const pathnames = {
  ...basePathnames,
  ...securityPathnames,
  ...managementPathnames,
  ...requestsPathnames,
  ...formsPathnames,
  ...settingsPathnames,
  ...globalPathnames,
} satisfies Pathnames<typeof locales>;

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

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
