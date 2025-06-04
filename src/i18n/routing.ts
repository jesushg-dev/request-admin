import { ComponentProps } from 'react';
import { createNavigation } from 'next-intl/navigation';
import { defineRouting, Pathnames } from 'next-intl/routing';

type Locale = 'en' | 'es';
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
  '/admin/[tenantId]/notifications': {
    en: '/admin/[tenantId]/notifications',
    es: '/admin/[tenantId]/notificaciones',
  },
} satisfies Pathnames<Locale[]>;

const requestsPathnames = {
  '/admin/[tenantId]/requests': {
    en: '/admin/[tenantId]/requests',
    es: '/admin/[tenantId]/solicitudes',
  },
  '/admin/[tenantId]/requests/new': {
    en: '/admin/[tenantId]/requests/new',
    es: '/admin/[tenantId]/solicitudes/nuevo',
  },
  '/admin/[tenantId]/requests/assign-massively': {
    en: '/admin/[tenantId]/requests/assign-massively',
    es: '/admin/[tenantId]/solicitudes/asignar-masivamente',
  },
  '/admin/[tenantId]/requests/[slug]': {
    en: '/admin/[tenantId]/requests/[slug]',
    es: '/admin/[tenantId]/solicitudes/[slug]',
  },
  '/admin/[tenantId]/requests/[slug]/edit': {
    en: '/admin/[tenantId]/requests/[slug]/edit',
    es: '/admin/[tenantId]/solicitudes/[slug]/editar',
  },
  '/admin/[tenantId]/requests/[slug]/relate': {
    en: '/admin/[tenantId]/requests/[slug]/relate',
    es: '/admin/[tenantId]/solicitudes/[slug]/relacionar',
  },
  //messages
  '/admin/[tenantId]/messages': {
    en: '/admin/[tenantId]/messages',
    es: '/admin/[tenantId]/mensajes',
  },
  //reports
  '/admin/[tenantId]/reports': {
    en: '/admin/[tenantId]/reports',
    es: '/admin/[tenantId]/reportes',
  },
  // areas
  '/admin/[tenantId]/configurations/areas': {
    en: '/admin/[tenantId]/configurations/areas',
    es: '/admin/[tenantId]/configuraciones/areas',
  },
  '/admin/[tenantId]/configurations/areas/new': {
    en: '/admin/[tenantId]/configurations/areas/new',
    es: '/admin/[tenantId]/configuraciones/areas/nuevo',
  },
  '/admin/[tenantId]/configurations/areas/[slug]': {
    en: '/admin/[tenantId]/configurations/areas/[slug]',
    es: '/admin/[tenantId]/configuraciones/areas/[slug]',
  },
  '/admin/[tenantId]/configurations/areas/[slug]/edit': {
    en: '/admin/[tenantId]/configurations/areas/[slug]/edit',
    es: '/admin/[tenantId]/configuraciones/areas/[slug]/editar',
  },
  // assignment hierarchies
  '/admin/[tenantId]/configurations/assignment-hierarchies': {
    en: '/admin/[tenantId]/configurations/assignment-hierarchies',
    es: '/admin/[tenantId]/configuraciones/jerarquias-de-asignacion',
  },
  '/admin/[tenantId]/configurations/assignment-hierarchies/new': {
    en: '/admin/[tenantId]/configurations/assignment-hierarchies/new',
    es: '/admin/[tenantId]/configuraciones/jerarquias-de-asignacion/nuevo',
  },
  '/admin/[tenantId]/configurations/assignment-hierarchies/[slug]': {
    en: '/admin/[tenantId]/configurations/assignment-hierarchies/[slug]',
    es: '/admin/[tenantId]/configuraciones/jerarquias-de-asignacion/[slug]',
  },
  '/admin/[tenantId]/configurations/assignment-hierarchies/[slug]/edit': {
    en: '/admin/[tenantId]/configurations/assignment-hierarchies/[slug]/edit',
    es: '/admin/[tenantId]/configuraciones/jerarquias-de-asignacion/[slug]/editar',
  },
  // Request types
  '/admin/[tenantId]/configurations/request-types': {
    en: '/admin/[tenantId]/configurations/request-types',
    es: '/admin/[tenantId]/configuraciones/tipo-de-solicitudes',
  },
  '/admin/[tenantId]/configurations/request-types/new': {
    en: '/admin/[tenantId]/configurations/request-types/new',
    es: '/admin/[tenantId]/configuraciones/tipo-de-solicitudes/nuevo',
  },
  '/admin/[tenantId]/configurations/request-types/[slug]': {
    en: '/admin/[tenantId]/configurations/request-types/[slug]',
    es: '/admin/[tenantId]/configuraciones/tipo-de-solicitudes/[slug]',
  },
  '/admin/[tenantId]/configurations/request-types/[slug]/edit': {
    en: '/admin/[tenantId]/configurations/request-types/[slug]/edit',
    es: '/admin/[tenantId]/configuraciones/tipo-de-solicitudes/[slug]/editar',
  },
  // request hierarchies
  '/admin/[tenantId]/configurations/request-hierarchies': {
    en: '/admin/[tenantId]/configurations/request-hierarchies',
    es: '/admin/[tenantId]/configuraciones/jerarquias-de-solicitudes',
  },
  '/admin/[tenantId]/configurations/request-hierarchies/new': {
    en: '/admin/[tenantId]/configurations/request-hierarchies/new',
    es: '/admin/[tenantId]/configuraciones/jerarquias-de-solicitudes/nuevo',
  },
  '/admin/[tenantId]/configurations/request-hierarchies/[slug]': {
    en: '/admin/[tenantId]/configurations/request-hierarchies/[slug]',
    es: '/admin/[tenantId]/configuraciones/jerarquias-de-solicitudes/[slug]',
  },
  '/admin/[tenantId]/configurations/request-hierarchies/[slug]/edit': {
    en: '/admin/[tenantId]/configurations/request-hierarchies/[slug]/edit',
    es: '/admin/[tenantId]/configuraciones/jerarquias-de-solicitudes/[slug]/editar',
  },
  // Requirements
  '/admin/[tenantId]/configurations/requirements': {
    en: '/admin/[tenantId]/configurations/requirements',
    es: '/admin/[tenantId]/configuraciones/requisitos',
  },
  '/admin/[tenantId]/configurations/requirements/new': {
    en: '/admin/[tenantId]/configurations/requirements/new',
    es: '/admin/[tenantId]/configuraciones/requisitos/nuevo',
  },
  '/admin/[tenantId]/configurations/requirements/[slug]': {
    en: '/admin/[tenantId]/configurations/requirements/[slug]',
    es: '/admin/[tenantId]/configuraciones/requisitos/[slug]',
  },
  '/admin/[tenantId]/configurations/requirements/[slug]/edit': {
    en: '/admin/[tenantId]/configurations/requirements/[slug]/edit',
    es: '/admin/[tenantId]/configuraciones/requisitos/[slug]/editar',
  },
  // Requirement types
  '/admin/[tenantId]/configurations/requirement-types': {
    en: '/admin/[tenantId]/configurations/requirement-types',
    es: '/admin/[tenantId]/configuraciones/tipos-de-requisitos',
  },
  '/admin/[tenantId]/configurations/requirement-types/new': {
    en: '/admin/[tenantId]/configurations/requirement-types/new',
    es: '/admin/[tenantId]/configuraciones/tipos-de-requisitos/nuevo',
  },
  '/admin/[tenantId]/configurations/requirement-types/[slug]': {
    en: '/admin/[tenantId]/configurations/requirement-types/[slug]',
    es: '/admin/[tenantId]/configuraciones/tipos-de-requisitos/[slug]',
  },
  '/admin/[tenantId]/configurations/requirement-types/[slug]/edit': {
    en: '/admin/[tenantId]/configurations/requirement-types/[slug]/edit',
    es: '/admin/[tenantId]/configuraciones/tipos-de-requisitos/[slug]/editar',
  },
  // priorities
  '/admin/[tenantId]/configurations/priorities': {
    en: '/admin/[tenantId]/configurations/priorities',
    es: '/admin/[tenantId]/configuraciones/prioridades',
  },
  '/admin/[tenantId]/configurations/priorities/new': {
    en: '/admin/[tenantId]/configurations/priorities/new',
    es: '/admin/[tenantId]/configuraciones/prioridades/nuevo',
  },
  '/admin/[tenantId]/configurations/priorities/[slug]': {
    en: '/admin/[tenantId]/configurations/priorities/[slug]',
    es: '/admin/[tenantId]/configuraciones/prioridades/[slug]',
  },
  '/admin/[tenantId]/configurations/priorities/[slug]/edit': {
    en: '/admin/[tenantId]/configurations/priorities/[slug]/edit',
    es: '/admin/[tenantId]/configuraciones/prioridades/[slug]/editar',
  },
  // workflows
  '/admin/[tenantId]/configurations/workflows': {
    en: '/admin/[tenantId]/configurations/workflows',
    es: '/admin/[tenantId]/configuraciones/workflows',
  },
  '/admin/[tenantId]/configurations/workflows/new': {
    en: '/admin/[tenantId]/configurations/workflows/new',
    es: '/admin/[tenantId]/configuraciones/workflows/nuevo',
  },
  '/admin/[tenantId]/configurations/workflows/[slug]': {
    en: '/admin/[tenantId]/configurations/workflows/[slug]',
    es: '/admin/[tenantId]/configuraciones/workflows/[slug]',
  },
  '/admin/[tenantId]/configurations/workflows/[slug]/edit': {
    en: '/admin/[tenantId]/configurations/workflows/[slug]/edit',
    es: '/admin/[tenantId]/configuraciones/workflows/[slug]/editar',
  },
} satisfies Pathnames<Locale[]>;

const securityPathnames = {
  // help
  '/admin/[tenantId]/help': {
    en: '/admin/[tenantId]/help',
    es: '/admin/[tenantId]/ayuda',
  },
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
  '/admin/global/tenants/[slug]/accept-invitation': {
    en: '/admin/global/tenants/[slug]/accept-invitation',
    es: '/admin/global/inquilinos/[slug]/aceptar-invitacion',
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
