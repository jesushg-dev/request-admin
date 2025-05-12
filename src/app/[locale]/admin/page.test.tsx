import { render, screen } from '@testing-library/react';

import TenantsPage from './page';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock i18n routing
jest.mock('@/i18n/routing', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

// Mock auth server
const mockCurrentSession = jest.fn().mockResolvedValue({
  user: { id: '1' },
});

jest.mock('@/server/auth-server', () => ({
  currentSession: () => mockCurrentSession(),
}));

// Mock database
const mockFindMany = jest.fn().mockResolvedValue([
  {
    id: '1',
    name: 'Test Tenant',
    logo: 'https://example.com/logo.png',
    description: 'Test Description',
    websiteUrl: 'https://example.com',
  },
]);

jest.mock('@/server/db-server', () => ({
  db: {
    tenant: {
      findMany: () => mockFindMany(),
    },
  },
}));

// Mock next/navigation
const mockRedirect = jest.fn();
jest.mock('next/navigation', () => ({
  redirect: () => mockRedirect(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

describe('TenantsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders tenant list when user is authenticated', async () => {
    render(await TenantsPage());

    expect(screen.getByText('brandName')).toBeInTheDocument();
    expect(screen.getByText('header.messageLine1')).toBeInTheDocument();
    expect(screen.getByText('header.messageLine2')).toBeInTheDocument();
    expect(screen.getByText('Test Tenant')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByAltText('Test Tenant')).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('redirects to home when user is not authenticated', async () => {
    mockCurrentSession.mockResolvedValueOnce(null);

    await TenantsPage();

    expect(mockRedirect).toHaveBeenCalledWith({ href: '/', locale: 'en' });
  });

  it('displays fallback avatar when tenant has no logo', async () => {
    mockFindMany.mockResolvedValueOnce([
      {
        id: '1',
        name: 'Test Tenant',
        logo: null,
        description: 'Test Description',
        websiteUrl: 'https://example.com',
      },
    ]);

    render(await TenantsPage());
    expect(screen.getByText('RE')).toBeInTheDocument();
  });
});
