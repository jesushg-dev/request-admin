import { defineRouting, Pathnames } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export type Locale = 'en' | 'es';
export const defaultLocale = 'en';
export const locales = ['en', 'es'] as const;
export const localePrefix = process.env.NEXT_PUBLIC_LOCALE_PREFIX === 'never' ? 'never' : 'as-needed';

export const pathnames = {
  '/': '/',
  '/admin': '/admin',
  '/admin/area': '/admin/area',
  '/admin/area/new': {
    en: '/admin/area/new',
    es: '/admin/area/nuevo',
  },
  '/admin/area/[slug]': {
    en: '/admin/area/[slug]',
    es: '/admin/area/[slug]',
  },
  '/admin/request': {
    en: '/admin/request',
    es: '/admin/caso',
  },
  '/admin/request/new': {
    en: '/admin/request/new',
    es: '/admin/caso/nuevo',
  },
  '/admin/request/[slug]': {
    en: '/admin/request/[slug]',
    es: '/admin/caso/[slug]',
  },
  //request-type
  '/admin/request-type': {
    en: '/admin/request-type',
    es: '/admin/tipo-de-caso',
  },
  '/admin/request-type/new': {
    en: '/admin/request-type/new',
    es: '/admin/tipo-de-caso/nuevo',
  },
  '/admin/request-type/[slug]': {
    en: '/admin/request-type/[slug]',
    es: '/admin/tipo-de-caso/[slug]',
  },
  // category
  '/admin/category': {
    en: '/admin/category',
    es: '/admin/categoria',
  },
  '/admin/category/new': {
    en: '/admin/category/new',
    es: '/admin/categoria/nuevo',
  },
  '/admin/category/[slug]': {
    en: '/admin/category/[slug]',
    es: '/admin/categoria/[slug]',
  },
  //client
  '/admin/client': {
    en: '/admin/client',
    es: '/admin/cliente',
  },
  '/admin/client/new': {
    en: '/admin/client/new',
    es: '/admin/cliente/nuevo',
  },
  '/admin/client/[slug]': {
    en: '/admin/client/[slug]',
    es: '/admin/cliente/[slug]',
  },
  //module
  '/admin/module': {
    en: '/admin/module',
    es: '/admin/modulo',
  },
  '/admin/module/new': {
    en: '/admin/module/new',
    es: '/admin/modulo/nuevo',
  },
  '/admin/module/[slug]': {
    en: '/admin/module/[slug]',
    es: '/admin/modulo/[slug]',
  },
  //requeriment
  '/admin/requirement': {
    en: '/admin/requirement',
    es: '/admin/requisito',
  },
  '/admin/requirement/new': {
    en: '/admin/requirement/new',
    es: '/admin/requisito/nuevo',
  },
  '/admin/requirement/[slug]': {
    en: '/admin/requirement/[slug]',
    es: '/admin/requisito/[slug]',
  },
  //roles
  '/admin/role': {
    en: '/admin/role',
    es: '/admin/rol',
  },
  '/admin/role/new': {
    en: '/admin/role/new',
    es: '/admin/rol/nuevo',
  },
  '/admin/role/[slug]': {
    en: '/admin/role/[slug]',
    es: '/admin/rol/[slug]',
  },
  //sales-channel
  '/admin/sales-channel': {
    en: '/admin/sales-channel',
    es: '/admin/canal-de-ventas',
  },
  '/admin/sales-channel/new': {
    en: '/admin/sales-channel/new',
    es: '/admin/canal-de-ventas/nuevo',
  },
  '/admin/sales-channel/[slug]': {
    en: '/admin/sales-channel/[slug]',
    es: '/admin/canal-de-ventas/[slug]',
  },
  //service-type
  '/admin/service-type': {
    en: '/admin/service-type',
    es: '/admin/tipo-de-servicio',
  },
  '/admin/service-type/new': {
    en: '/admin/service-type/new',
    es: '/admin/tipo-de-servicio/nuevo',
  },
  '/admin/service-type/[slug]': {
    en: '/admin/service-type/[slug]',
    es: '/admin/tipo-de-servicio/[slug]',
  },
  //user
  '/admin/user': {
    en: '/admin/user',
    es: '/admin/usuario',
  },
  '/admin/user/new': {
    en: '/admin/user/new',
    es: '/admin/usuario/nuevo',
  },
  '/admin/user/[slug]': {
    en: '/admin/user/[slug]',
    es: '/admin/usuario/[slug]',
  },
  //document
  '/admin/document': {
    en: '/admin/document',
    es: '/admin/documento',
  },
  '/admin/document/new': {
    en: '/admin/document/new',
    es: '/admin/documento/nuevo',
  },
  '/admin/document/[slug]': {
    en: '/admin/document/[slug]',
    es: '/admin/documento/[slug]',
  },
  //form
  '/admin/form': {
    en: '/admin/form',
    es: '/admin/formulario',
  },
  '/admin/form/new': {
    en: '/admin/form/new',
    es: '/admin/formulario/nuevo',
  },
  '/admin/form/[slug]': {
    en: '/admin/form/[slug]',
    es: '/admin/formulario/[slug]',
  },
  //settings
  '/admin/settings': {
    en: '/admin/settings',
    es: '/admin/configuracion',
  },
  '/admin/settings/account': {
    en: '/admin/settings/account',
    es: '/admin/configuracion/cuenta',
  },
  '/admin/settings/smtp': {
    en: '/admin/settings/smtp',
    es: '/admin/configuracion/smtp',
  },
  '/admin/settings/credit-card': {
    en: '/admin/settings/credit-card',
    es: '/admin/configuracion/tarjeta-de-credito',
  },
  '/admin/settings/social': {
    en: '/admin/settings/social',
    es: '/admin/configuracion/redes-sociales',
  },
  '/admin/settings/tenant': {
    en: '/admin/settings/tenant',
    es: '/admin/configuracion/inquilino',
  },
  ///admin/form-designer
  '/admin/form-designer': {
    en: '/admin/form-designer',
    es: '/admin/diseñador-de-formularios',
  },
  //identification-type
  '/admin/identification-type': {
    en: '/admin/identification-type',
    es: '/admin/tipo-de-identificacion',
  },
  '/admin/identification-type/new': {
    en: '/admin/identification-type/new',
    es: '/admin/tipo-de-identificacion/nuevo',
  },
  '/admin/identification-type/[slug]': {
    en: '/admin/identification-type/[slug]',
    es: '/admin/tipo-de-identificacion/[slug]',
  },
  //tenant
  '/admin/tenant': {
    en: '/admin/tenant',
    es: '/admin/inquilino',
  },
  '/admin/tenant/new': {
    en: '/admin/tenant/new',
    es: '/admin/inquilino/nuevo',
  },
  '/admin/tenant/[slug]': {
    en: '/admin/tenant/[slug]',
    es: '/admin/inquilino/[slug]',
  },
  //about
  '/about/privacy-policy': {
    en: '/about/privacy-policy',
    es: '/acerca-de/politica-de-privacidad',
  },
  '/about/terms-of-service': {
    en: '/about/terms-of-service',
    es: '/acerca-de/terminos-de-servicio',
  },
  '/tenant/onboarding': {
    en: '/tenant/onboarding',
    es: '/inquilino/registro',
  },
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
