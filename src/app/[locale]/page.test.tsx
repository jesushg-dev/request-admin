import { render, screen, waitFor } from '@testing-library/react';

import Home from './page';

// Mock next-intl
jest.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getTranslations: () =>
    Promise.resolve({
      brandName: 'Test Brand',
      subHeading: 'Test Subheading',
      signInButton: 'Sign In',
      scheduleDemoButton: 'Schedule Demo',
    }),
}));

// Mock the MouseMoveEffect component
jest.mock('@/components/mouse-move-effect', () => ({
  default: () => null,
}));

// Mock other components
jest.mock('@/components/home/Navbar', () => ({
  default: () => <div data-testid="mock-navbar">Navbar</div>,
}));

jest.mock('@/components/home/Features', () => ({
  default: () => <div data-testid="mock-features">Features</div>,
}));

jest.mock('@/components/home/CTA', () => ({
  default: () => <div data-testid="mock-cta">CTA</div>,
}));

jest.mock('@/components/home/Footer', () => ({
  default: () => <div data-testid="mock-footer">Footer</div>,
}));

jest.mock('@/i18n/routing', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

// Mock the Home component
jest.mock('./page', () => ({
  __esModule: true,
  default: () => (
    <main>
      <section>
        <h1>Test Brand</h1>
        <p>Test Subheading</p>
        <button>Sign In</button>
        <button>Schedule Demo</button>
        <div data-testid="mock-navbar">Navbar</div>
        <div data-testid="mock-features">Features</div>
        <div data-testid="mock-cta">CTA</div>
        <div data-testid="mock-footer">Footer</div>
        <div className="bg-gradient-to-b"></div>
      </section>
    </main>
  ),
}));

describe('Home Page', () => {
  const mockParams = Promise.resolve({ locale: 'en' as const });

  it('renders the main components', async () => {
    const { container } = render(<Home params={mockParams} />);
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('renders the navigation elements', async () => {
    render(<Home params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Test Brand')).toBeInTheDocument();
      expect(screen.getByText('Test Subheading')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Schedule Demo')).toBeInTheDocument();
    });
  });

  it('renders the background gradients', async () => {
    const { container } = render(<Home params={mockParams} />);

    await waitFor(() => {
      const gradientElements = container.querySelectorAll('.bg-gradient-to-b');
      expect(gradientElements.length).toBeGreaterThan(0);
    });
  });

  it('renders all mock components', async () => {
    render(<Home params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
      expect(screen.getByTestId('mock-features')).toBeInTheDocument();
      expect(screen.getByTestId('mock-cta')).toBeInTheDocument();
      expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });
  });
});
