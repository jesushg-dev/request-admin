import { createNavigation } from 'next-intl/navigation';
import { defineRouting, Pathnames } from 'next-intl/routing';

export type Locale = 'en' | 'es';
export const defaultLocale = 'en';
export const locales = ['en', 'es'] as const;
export const localePrefix = process.env.NEXT_PUBLIC_LOCALE_PREFIX === 'never' ? 'never' : 'as-needed';

const securityPathnames = {
  // security
  '/[tenantId]/admin/security': {
    en: '/[tenantId]/admin/security',
    es: '/[tenantId]/admin/seguridad',
  },
  // roles
  '/[tenantId]/admin/security/role': {
    en: '/[tenantId]/admin/security/role',
    es: '/[tenantId]/admin/seguridad/rol',
  },
  '/[tenantId]/admin/security/role/new': {
    en: '/[tenantId]/admin/security/role/new',
    es: '/[tenantId]/admin/seguridad/rol/nuevo',
  },
  '/[tenantId]/admin/security/role/[slug]': {
    en: '/[tenantId]/admin/security/role/[slug]',
    es: '/[tenantId]/admin/seguridad/rol/[slug]',
  },
  // user
  '/[tenantId]/admin/security/user': {
    en: '/[tenantId]/admin/security/user',
    es: '/[tenantId]/admin/seguridad/usuario',
  },
  '/[tenantId]/admin/security/user/new': {
    en: '/[tenantId]/admin/security/user/new',
    es: '/[tenantId]/admin/seguridad/usuario/nuevo',
  },
  '/[tenantId]/admin/security/user/[slug]': {
    en: '/[tenantId]/admin/security/user/[slug]',
    es: '/[tenantId]/admin/seguridad/usuario/[slug]',
  },
} satisfies Pathnames<typeof locales>;

export const pathnames = {
  '/': '/',
  '/tenants': '/tenants',
  '/tenants/admin/new': '/tenants/admin/new',
  '/[tenantId]/admin': '/[tenantId]/admin',
  '/[tenantId]/admin/management/area': '/[tenantId]/admin/management/area',
  '/[tenantId]/admin/management/area/new': {
    en: '/[tenantId]/admin/management/area/new',
    es: '/[tenantId]/admin/gestion/area/nuevo',
  },
  '/[tenantId]/admin/management/area/[slug]': {
    en: '/[tenantId]/admin/management/area/[slug]',
    es: '/[tenantId]/admin/gestion/area/[slug]',
  },
  // client
  '/[tenantId]/admin/management/client': {
    en: '/[tenantId]/admin/management/client',
    es: '/[tenantId]/admin/gestion/cliente',
  },
  '/[tenantId]/admin/client/new': {
    en: '/[tenantId]/admin/client/new',
    es: '/[tenantId]/admin/cliente/nuevo',
  },
  '/[tenantId]/admin/client/[slug]': {
    en: '/[tenantId]/admin/client/[slug]',
    es: '/[tenantId]/admin/cliente/[slug]',
  },
  '/[tenantId]/admin/request': {
    en: '/[tenantId]/admin/request',
    es: '/[tenantId]/admin/caso',
  },
  '/[tenantId]/admin/request/new': {
    en: '/[tenantId]/admin/request/new',
    es: '/[tenantId]/admin/caso/nuevo',
  },
  '/[tenantId]/admin/request/[slug]': {
    en: '/[tenantId]/admin/request/[slug]',
    es: '/[tenantId]/admin/caso/[slug]',
  },
  // request-type
  '/[tenantId]/admin/request-type': {
    en: '/[tenantId]/admin/request-type',
    es: '/[tenantId]/admin/tipo-de-caso',
  },
  '/[tenantId]/admin/request-type/new': {
    en: '/[tenantId]/admin/request-type/new',
    es: '/[tenantId]/admin/tipo-de-caso/nuevo',
  },
  '/[tenantId]/admin/request-type/[slug]': {
    en: '/[tenantId]/admin/request-type/[slug]',
    es: '/[tenantId]/admin/tipo-de-caso/[slug]',
  },
  // requirement
  '/[tenantId]/admin/requirement': {
    en: '/[tenantId]/admin/requirement',
    es: '/[tenantId]/admin/requisito',
  },
  '/[tenantId]/admin/requirement/new': {
    en: '/[tenantId]/admin/requirement/new',
    es: '/[tenantId]/admin/requisito/nuevo',
  },
  '/[tenantId]/admin/requirement/[slug]': {
    en: '/[tenantId]/admin/requirement/[slug]',
    es: '/[tenantId]/admin/requisito/[slug]',
  },
  // document
  '/[tenantId]/admin/document': {
    en: '/[tenantId]/admin/document',
    es: '/[tenantId]/admin/documento',
  },
  '/[tenantId]/admin/document/new': {
    en: '/[tenantId]/admin/document/new',
    es: '/[tenantId]/admin/documento/nuevo',
  },
  '/[tenantId]/admin/document/[slug]': {
    en: '/[tenantId]/admin/document/[slug]',
    es: '/[tenantId]/admin/documento/[slug]',
  },
  // form
  '/[tenantId]/admin/form': {
    en: '/[tenantId]/admin/form',
    es: '/[tenantId]/admin/formulario',
  },
  '/[tenantId]/admin/form/new': {
    en: '/[tenantId]/admin/form/new',
    es: '/[tenantId]/admin/formulario/nuevo',
  },
  '/[tenantId]/admin/form/[slug]': {
    en: '/[tenantId]/admin/form/[slug]',
    es: '/[tenantId]/admin/formulario/[slug]',
  },
  // settings
  '/[tenantId]/admin/settings': {
    en: '/[tenantId]/admin/settings',
    es: '/[tenantId]/admin/configuracion',
  },
  '/[tenantId]/admin/settings/account': {
    en: '/[tenantId]/admin/settings/account',
    es: '/[tenantId]/admin/configuracion/cuenta',
  },
  '/[tenantId]/admin/settings/smtp': {
    en: '/[tenantId]/admin/settings/smtp',
    es: '/[tenantId]/admin/configuracion/smtp',
  },
  '/[tenantId]/admin/settings/credit-card': {
    en: '/[tenantId]/admin/settings/credit-card',
    es: '/[tenantId]/admin/configuracion/tarjeta-de-credito',
  },
  '/[tenantId]/admin/settings/social': {
    en: '/[tenantId]/admin/settings/social',
    es: '/[tenantId]/admin/configuracion/redes-sociales',
  },
  '/[tenantId]/admin/settings/tenant': {
    en: '/[tenantId]/admin/settings/tenant',
    es: '/[tenantId]/admin/configuracion/inquilino',
  },
  // form-designer
  '/[tenantId]/admin/form-designer': {
    en: '/[tenantId]/admin/form-designer',
    es: '/[tenantId]/admin/disenador-de-formularios',
  },
  // identification-type
  '/[tenantId]/admin/identification-type': {
    en: '/[tenantId]/admin/identification-type',
    es: '/[tenantId]/admin/tipo-de-identificacion',
  },
  '/[tenantId]/admin/identification-type/new': {
    en: '/[tenantId]/admin/identification-type/new',
    es: '/[tenantId]/admin/tipo-de-identificacion/nuevo',
  },
  '/[tenantId]/admin/identification-type/[slug]': {
    en: '/[tenantId]/admin/identification-type/[slug]',
    es: '/[tenantId]/admin/tipo-de-identificacion/[slug]',
  },
  // tenant
  '/[tenantId]/admin/tenant': {
    en: '/[tenantId]/admin/tenant',
    es: '/[tenantId]/admin/inquilino',
  },
  '/[tenantId]/admin/tenant/new': {
    en: '/[tenantId]/admin/tenant/new',
    es: '/[tenantId]/admin/inquilino/nuevo',
  },
  '/[tenantId]/admin/tenant/[slug]': {
    en: '/[tenantId]/admin/tenant/[slug]',
    es: '/[tenantId]/admin/inquilino/[slug]',
  },
  ...securityPathnames,
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
