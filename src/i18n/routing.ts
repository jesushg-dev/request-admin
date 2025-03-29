import { ComponentProps } from 'react';
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
  '/auth/login': {
    en: '/auth/login',
    es: '/auth/iniciar-sesion',
  },
  '/auth/login/2fa': {
    en: '/auth/login/2fa',
    es: '/auth/iniciar-sesion/2fa',
  },
  '/auth/logout': {
    en: '/auth/logout',
    es: '/auth/cerrar-sesion',
  },
  '/auth/reset': {
    en: '/auth/reset',
    es: '/auth/reiniciar',
  },
  '/auth/register': {
    en: '/auth/register',
    es: '/auth/registrar',
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
  // identification types
  '/admin/[tenantId]/security/identification-types': {
    en: '/admin/[tenantId]/security/identification-types',
    es: '/admin/[tenantId]/seguridad/tipos-de-identificacion',
  },
  '/admin/[tenantId]/security/identification-types/new': {
    en: '/admin/[tenantId]/security/identification-types/new',
    es: '/admin/[tenantId]/seguridad/tipos-de-identificacion/nuevo',
  },
  '/admin/[tenantId]/security/identification-types/[slug]': {
    en: '/admin/[tenantId]/security/identification-types/[slug]',
    es: '/admin/[tenantId]/seguridad/tipos-de-identificacion/[slug]',
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
  '/admin/[tenantId]/requests-portal/requests/assign-massively': {
    en: '/admin/[tenantId]/requests-portal/requests/assign-massively',
    es: '/admin/[tenantId]/solicitudes-portal/solicitudes/asignar-masivamente',
  },
  '/admin/[tenantId]/requests-portal/requests/[slug]': {
    en: '/admin/[tenantId]/requests-portal/requests/[slug]',
    es: '/admin/[tenantId]/solicitudes-portal/solicitudes/[slug]',
  },
  '/admin/[tenantId]/requests-portal/requests/[slug]/edit': {
    en: '/admin/[tenantId]/requests-portal/requests/[slug]/edit',
    es: '/admin/[tenantId]/solicitudes-portal/solicitudes/[slug]/editar',
  },
  '/admin/[tenantId]/requests-portal/requests/[slug]/relate': {
    en: '/admin/[tenantId]/requests-portal/requests/[slug]/relate',
    es: '/admin/[tenantId]/solicitudes-portal/solicitudes/[slug]/relacionar',
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
  // hierarchies
  '/admin/[tenantId]/settings/hierarchies/assignment': {
    en: '/admin/[tenantId]/settings/hierarchies/assignment',
    es: '/admin/[tenantId]/configuraciones/jerarquias/asignacion',
  },
  '/admin/[tenantId]/settings/hierarchies/request': {
    en: '/admin/[tenantId]/settings/hierarchies/request',
    es: '/admin/[tenantId]/configuraciones/jerarquias/solicitud',
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
  // areas
  '/admin/[tenantId]/requests-portal/areas': {
    en: '/admin/[tenantId]/requests-portal/areas',
    es: '/admin/[tenantId]/solicitudes-portal/areas',
  },
  '/admin/[tenantId]/requests-portal/areas/new': {
    en: '/admin/[tenantId]/requests-portal/areas/new',
    es: '/admin/[tenantId]/solicitudes-portal/areas/nuevo',
  },
  '/admin/[tenantId]/requests-portal/areas/[slug]': {
    en: '/admin/[tenantId]/requests-portal/areas/[slug]',
    es: '/admin/[tenantId]/solicitudes-portal/areas/[slug]',
  },
  '/admin/[tenantId]/requests-portal/areas/[slug]/edit': {
    en: '/admin/[tenantId]/requests-portal/areas/[slug]/edit',
    es: '/admin/[tenantId]/solicitudes-portal/areas/[slug]/editar',
  },
} satisfies Pathnames<Locale[]>;

const formsPathnames = {
  // form designer
  '/admin/[tenantId]/form-designer': {
    en: '/admin/[tenantId]/form-designer',
    es: '/admin/[tenantId]/disenador-de-formularios',
  },
  '/admin/[tenantId]/form-designer/new': {
    en: '/admin/[tenantId]/form-designer/new',
    es: '/admin/[tenantId]/disenador-de-formularios/nuevo',
  },
  '/admin/[tenantId]/form-designer/[slug]': {
    en: '/admin/[tenantId]/form-designer/[slug]',
    es: '/admin/[tenantId]/disenador-de-formularios/[slug]',
  },
  '/admin/[tenantId]/form-designer/[slug]/edit': {
    en: '/admin/[tenantId]/form-designer/[slug]/edit',
    es: '/admin/[tenantId]/disenador-de-formularios/[slug]/editar',
  },
  '/admin/[tenantId]/form-designer/[slug]/new': {
    en: '/admin/[tenantId]/form-designer/[slug]/new',
    es: '/admin/[tenantId]/disenador-de-formularios/[slug]/nuevo',
  },
} satisfies Pathnames<Locale[]>;

const dataRoomsPathnames = {
  // data rooms
  '/admin/[tenantId]/links-and-documents/data-rooms': {
    en: '/admin/[tenantId]/links-and-documents/data-rooms',
    es: '/admin/[tenantId]/enlaces-y-documentos/salas-de-datos',
  },
  '/admin/[tenantId]/links-and-documents/data-rooms/new': {
    en: '/admin/[tenantId]/links-and-documents/data-rooms/new',
    es: '/admin/[tenantId]/enlaces-y-documentos/salas-de-datos/nuevo',
  },
  '/admin/[tenantId]/links-and-documents/data-rooms/[slug]': {
    en: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]',
    es: '/admin/[tenantId]/enlaces-y-documentos/salas-de-datos/[slug]',
  },
  '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/edit': {
    en: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/edit',
    es: '/admin/[tenantId]/enlaces-y-documentos/salas-de-datos/[slug]/editar',
  },
  '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/viewers': {
    en: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/viewers',
    es: '/admin/[tenantId]/enlaces-y-documentos/salas-de-datos/[slug]/visualizadores',
  },

  '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/viewers/new': {
    en: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/viewers/new',
    es: '/admin/[tenantId]/enlaces-y-documentos/salas-de-datos/[slug]/visualizadores/nuevo',
  },
  '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/branding': {
    en: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/branding',
    es: '/admin/[tenantId]/enlaces-y-documentos/salas-de-datos/[slug]/marca',
  },
  // documents
  '/admin/[tenantId]/links-and-documents/documents': {
    en: '/admin/[tenantId]/links-and-documents/documents',
    es: '/admin/[tenantId]/enlaces-y-documentos/documentos',
  },
  '/admin/[tenantId]/links-and-documents/documents/upload': {
    en: '/admin/[tenantId]/links-and-documents/documents/upload',
    es: '/admin/[tenantId]/enlaces-y-documentos/documentos/nuevo',
  },
  '/admin/[tenantId]/links-and-documents/documents/[slug]': {
    en: '/admin/[tenantId]/links-and-documents/documents/[slug]',
    es: '/admin/[tenantId]/enlaces-y-documentos/documentos/[slug]',
  },
  '/admin/[tenantId]/links-and-documents/documents/[slug]/edit': {
    en: '/admin/[tenantId]/links-and-documents/documents/[slug]/edit',
    es: '/admin/[tenantId]/enlaces-y-documentos/documentos/[slug]/editar',
  },
  // agreements
  '/admin/[tenantId]/links-and-documents/agreements': {
    en: '/admin/[tenantId]/links-and-documents/agreements',
    es: '/admin/[tenantId]/enlaces-y-documentos/acuerdos',
  },
  '/admin/[tenantId]/links-and-documents/agreements/new': {
    en: '/admin/[tenantId]/links-and-documents/agreements/new',
    es: '/admin/[tenantId]/enlaces-y-documentos/acuerdos/nuevo',
  },
  '/admin/[tenantId]/links-and-documents/agreements/[slug]': {
    en: '/admin/[tenantId]/links-and-documents/agreements/[slug]',
    es: '/admin/[tenantId]/enlaces-y-documentos/acuerdos/[slug]',
  },
  '/admin/[tenantId]/links-and-documents/agreements/[slug]/edit': {
    en: '/admin/[tenantId]/links-and-documents/agreements/[slug]/edit',
    es: '/admin/[tenantId]/enlaces-y-documentos/acuerdos/[slug]/editar',
  },
  // folders
  '/admin/[tenantId]/links-and-documents/folders/new': {
    en: '/admin/[tenantId]/links-and-documents/folders/new',
    es: '/admin/[tenantId]/enlaces-y-documentos/carpetas/nuevo',
  },
  '/admin/[tenantId]/links-and-documents/folders/[slug]/edit': {
    en: '/admin/[tenantId]/links-and-documents/folders/[slug]/edit',
    es: '/admin/[tenantId]/enlaces-y-documentos/carpetas/[slug]/editar',
  },
  // links
  '/admin/[tenantId]/links-and-documents/links': {
    en: '/admin/[tenantId]/links-and-documents/links',
    es: '/admin/[tenantId]/enlaces-y-documentos/enlaces',
  },
  '/admin/[tenantId]/links-and-documents/links/new': {
    en: '/admin/[tenantId]/links-and-documents/links/new',
    es: '/admin/[tenantId]/enlaces-y-documentos/enlaces/nuevo',
  },
  '/admin/[tenantId]/links-and-documents/links/[slug]': {
    en: '/admin/[tenantId]/links-and-documents/links/[slug]',
    es: '/admin/[tenantId]/enlaces-y-documentos/enlaces/[slug]',
  },
  '/admin/[tenantId]/links-and-documents/links/[slug]/edit': {
    en: '/admin/[tenantId]/links-and-documents/links/[slug]/edit',
    es: '/admin/[tenantId]/enlaces-y-documentos/enlaces/[slug]/editar',
  },
} satisfies Pathnames<Locale[]>;

const settingsPathnames = {
  // settings
  '/admin/[tenantId]/settings': {
    en: '/admin/[tenantId]/settings',
    es: '/admin/[tenantId]/configuracion',
  },

  // account
  '/admin/[tenantId]/settings/account': {
    en: '/admin/[tenantId]/settings/account',
    es: '/admin/[tenantId]/configuracion/cuenta',
  },

  // organization
  '/admin/[tenantId]/settings/organization': {
    en: '/admin/[tenantId]/settings/organization',
    es: '/admin/[tenantId]/configuracion/organizacion',
  },
  '/admin/[tenantId]/settings/organization/person': {
    en: '/admin/[tenantId]/settings/organization/person',
    es: '/admin/[tenantId]/configuracion/organizacion/persona',
  },
  '/admin/[tenantId]/settings/organization/roles-and-access': {
    en: '/admin/[tenantId]/settings/organization/roles-and-access',
    es: '/admin/[tenantId]/configuracion/organizacion/roles-y-acceso',
  },
  '/admin/[tenantId]/settings/organization/smtp': {
    en: '/admin/[tenantId]/settings/organization/smtp',
    es: '/admin/[tenantId]/configuracion/organizacion/smtp',
  },
  '/admin/[tenantId]/settings/organization/subscription': {
    en: '/admin/[tenantId]/settings/organization/subscription',
    es: '/admin/[tenantId]/configuracion/organizacion/suscripcion',
  },
  '/admin/[tenantId]/settings/organization/request-hierarchy': {
    en: '/admin/[tenantId]/settings/organization/request-hierarchy',
    es: '/admin/[tenantId]/configuracion/organizacion/jerarquia-solicitud',
  },
  '/admin/[tenantId]/settings/organization/assignment-hierarchy': {
    en: '/admin/[tenantId]/settings/organization/assignment-hierarchy',
    es: '/admin/[tenantId]/configuracion/organizacion/jerarquia-asignacion',
  },

  // preferences
  '/admin/[tenantId]/settings/preferences': {
    en: '/admin/[tenantId]/settings/preferences',
    es: '/admin/[tenantId]/configuracion/preferencias',
  },
  '/admin/[tenantId]/settings/preferences/appearance': {
    en: '/admin/[tenantId]/settings/preferences/appearance',
    es: '/admin/[tenantId]/configuracion/preferencias/apariencia',
  },
  '/admin/[tenantId]/settings/preferences/notifications': {
    en: '/admin/[tenantId]/settings/preferences/notifications',
    es: '/admin/[tenantId]/configuracion/preferencias/notificaciones',
  },

  // security
  '/admin/[tenantId]/settings/security': {
    en: '/admin/[tenantId]/settings/security',
    es: '/admin/[tenantId]/configuracion/seguridad',
  },
  '/admin/[tenantId]/settings/security/api-keys': {
    en: '/admin/[tenantId]/settings/security/api-keys',
    es: '/admin/[tenantId]/configuracion/seguridad/claves-api',
  },
  '/admin/[tenantId]/settings/security/api-keys/new': {
    en: '/admin/[tenantId]/settings/security/api-keys/new',
    es: '/admin/[tenantId]/configuracion/seguridad/claves-api/nuevo',
  },
  '/admin/[tenantId]/settings/security/connected-accounts': {
    en: '/admin/[tenantId]/settings/security/connected-accounts',
    es: '/admin/[tenantId]/configuracion/seguridad/cuentas-conectadas',
  },
  '/admin/[tenantId]/settings/security/email': {
    en: '/admin/[tenantId]/settings/security/email',
    es: '/admin/[tenantId]/configuracion/seguridad/correo',
  },
  '/admin/[tenantId]/settings/security/password': {
    en: '/admin/[tenantId]/settings/security/password',
    es: '/admin/[tenantId]/configuracion/seguridad/contrasena',
  },
  '/admin/[tenantId]/settings/security/sessions': {
    en: '/admin/[tenantId]/settings/security/sessions',
    es: '/admin/[tenantId]/configuracion/seguridad/sesiones',
  },
  '/admin/[tenantId]/settings/security/two-factor': {
    en: '/admin/[tenantId]/settings/security/two-factor',
    es: '/admin/[tenantId]/configuracion/seguridad/doble-factor',
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
  ...requestsPathnames,
  ...formsPathnames,
  ...dataRoomsPathnames,
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
      path !== '/' && // Exclude root path explicitly
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
export type I18Link = ComponentProps<typeof Link>['href'];
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
