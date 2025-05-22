import { env } from '@/env';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: 'Table',
  description: 'Shadcn table with server side sorting, pagination, and filtering',
  url: env.NODE_ENV === 'development' ? 'http://127.0.0.1:3000' : 'https://request-admin.vercel.app',
  links: { github: '' },
};
