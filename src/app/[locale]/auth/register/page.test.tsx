import { ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/server/auth-client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import RegisterForm from './page';

// Mock authClient
jest.mock('@/server/auth-client', () => ({
  authClient: {
    signUp: {
      email: jest.fn().mockResolvedValue({}),
    },
  },
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock i18n routing
jest.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

// Mock useSearchParams
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

const renderWithProviders = (component: ReactNode) => {
  return render(<>{component}</>);
};

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });
  });

  it('renders form correctly', () => {
    renderWithProviders(<RegisterForm />);

    expect(screen.getByPlaceholderText('placeholders.username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholders.email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholders.password')).toBeInTheDocument();
    expect(screen.getByText('actions.createAccount')).toBeInTheDocument();
    expect(screen.getByText('headerTitle')).toBeInTheDocument();
    expect(screen.getByText('headerLabel')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    renderWithProviders(<RegisterForm />);

    const usernameInput = screen.getByPlaceholderText('placeholders.username');
    const emailInput = screen.getByPlaceholderText('placeholders.email');
    const passwordInput = screen.getByPlaceholderText('placeholders.password');
    const submitButton = screen.getByText('actions.createAccount');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPassword123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authClient.signUp.email).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
          password: 'ValidPassword123!',
          name: 'testuser',
          callbackURL: '/admin',
        },
        expect.objectContaining({
          onRequest: expect.any(Function),
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });
  });

  it('validates required fields', async () => {
    renderWithProviders(<RegisterForm />);
    const submitButton = screen.getByText('actions.createAccount');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('placeholders.username')).toBeInvalid();
      expect(screen.getByPlaceholderText('placeholders.email')).toBeInvalid();
      expect(screen.getByPlaceholderText('placeholders.password')).toBeInvalid();
    });
  });

  it('disables button during submission', async () => {
    renderWithProviders(<RegisterForm />);
    const usernameInput = screen.getByPlaceholderText('placeholders.username');
    const emailInput = screen.getByPlaceholderText('placeholders.email');
    const passwordInput = screen.getByPlaceholderText('placeholders.password');
    const submitButton = screen.getByText('actions.createAccount');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPassword123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('has correct back button link', () => {
    renderWithProviders(<RegisterForm />);

    const backButton = screen.getByText('alreadyHaveAccount');
    expect(backButton).toBeInTheDocument();
    expect(backButton.closest('a')).toHaveAttribute('href', '/auth/login');
  });

  it('uses custom callback URL when provided', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('/custom-callback'),
    });

    renderWithProviders(<RegisterForm />);

    const usernameInput = screen.getByPlaceholderText('placeholders.username');
    const emailInput = screen.getByPlaceholderText('placeholders.email');
    const passwordInput = screen.getByPlaceholderText('placeholders.password');
    const submitButton = screen.getByText('actions.createAccount');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPassword123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authClient.signUp.email).toHaveBeenCalledWith(
        expect.objectContaining({
          callbackURL: '/custom-callback',
        }),
        expect.any(Object)
      );
    });
  });
});
