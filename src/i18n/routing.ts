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
} satisfies Pathnames<typeof locales>;

const requestsPathnames = {
  // requests
  '/admin/[tenantId]/requests': {
    en: '/admin/[tenantId]/requests',
    es: '/admin/[tenantId]/casos',
  },
  '/admin/[tenantId]/requests/new': {
    en: '/admin/[tenantId]/requests/new',
    es: '/admin/[tenantId]/casos/nuevo',
  },
  '/admin/[tenantId]/requests/[slug]': {
    en: '/admin/[tenantId]/requests/[slug]',
    es: '/admin/[tenantId]/casos/[slug]',
  },
  // request types
  '/admin/[tenantId]/request-types': {
    en: '/admin/[tenantId]/request-types',
    es: '/admin/[tenantId]/tipo-de-casos',
  },
  '/admin/[tenantId]/request-types/new': {
    en: '/admin/[tenantId]/request-types/new',
    es: '/admin/[tenantId]/tipo-de-casos/nuevo',
  },
  '/admin/[tenantId]/request-types/[slug]': {
    en: '/admin/[tenantId]/request-types/[slug]',
    es: '/admin/[tenantId]/tipo-de-casos/[slug]',
  },
} satisfies Pathnames<typeof locales>;

const requirementsPathnames = {
  // requirements
  '/admin/[tenantId]/requirements': {
    en: '/admin/[tenantId]/requirements',
    es: '/admin/[tenantId]/requisitos',
  },
  '/admin/[tenantId]/requirements/new': {
    en: '/admin/[tenantId]/requirements/new',
    es: '/admin/[tenantId]/requisitos/nuevo',
  },
  '/admin/[tenantId]/requirements/[slug]': {
    en: '/admin/[tenantId]/requirements/[slug]',
    es: '/admin/[tenantId]/requisitos/[slug]',
  },
} satisfies Pathnames<typeof locales>;

const documentsPathnames = {
  // documents
  '/admin/[tenantId]/documents': {
    en: '/admin/[tenantId]/documents',
    es: '/admin/[tenantId]/documentos',
  },
  '/admin/[tenantId]/documents/new': {
    en: '/admin/[tenantId]/documents/new',
    es: '/admin/[tenantId]/documentos/nuevo',
  },
  '/admin/[tenantId]/documents/[slug]': {
    en: '/admin/[tenantId]/documents/[slug]',
    es: '/admin/[tenantId]/documentos/[slug]',
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
  ...requirementsPathnames,
  ...documentsPathnames,
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
