import { Locale } from 'next-intl';

export type Role = {
  label: string;
  value: string;
  description: string;
};

export const roles: Record<Locale, Role[]> = {
  en: [
    { label: 'Owner', value: 'owner', description: 'The user who created the organization by default. The owner has full control over the organization and can perform any action.' },
    { label: 'Admin', value: 'admin', description: 'Users with the admin role have full control over the organization except for deleting the organization or changing the owner.' },
    {
      label: 'Member',
      value: 'member',
      description: 'Users with the member role have limited control over the organization. They can create projects, invite users, and manage projects they have created.',
    },
  ],
  es: [
    {
      label: 'Propietario',
      value: 'owner',
      description: 'El usuario que creó la organización por defecto. El propietario tiene control total sobre la organización y puede realizar cualquier acción.',
    },
    {
      label: 'Administrador',
      value: 'admin',
      description: 'Los usuarios con el rol de administrador tienen control total sobre la organización excepto para eliminar la organización o cambiar el propietario.',
    },
    {
      label: 'Miembro',
      value: 'member',
      description: 'Los usuarios con el rol de miembro tienen control limitado sobre la organización. Pueden crear proyectos, invitar usuarios y gestionar los proyectos que han creado.',
    },
  ],
};

export const getRoles = (lang: Locale = 'en'): Role[] => roles[lang];
