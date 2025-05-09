import { ReactNode } from 'react';
import { authClient } from '@/server/auth-client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import NewPasswordForm from './page';

// Mock authClient
jest.mock('@/server/auth-client', () => ({
  authClient: {
    resetPassword: jest.fn().mockResolvedValue({}),
  },
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('token=test-token'),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock i18n routing
jest.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

// Mock sonner
jest.mock('sonner', () => {
  const mockToast = jest.fn(() => 'toast-id') as jest.Mock & {
    error: jest.Mock;
    success: jest.Mock;
    loading: jest.Mock;
  };
  mockToast.error = jest.fn();
  mockToast.success = jest.fn();
  mockToast.loading = jest.fn();
  return { toast: mockToast };
});

describe('NewPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form correctly', () => {
    render(<NewPasswordForm />);

    expect(screen.getByPlaceholderText('placeholders.password')).toBeInTheDocument();
    expect(screen.getByText('actions.resetPassword')).toBeInTheDocument();
    expect(screen.getByText('headerTitle')).toBeInTheDocument();
    expect(screen.getByText('headerLabel')).toBeInTheDocument();
  });

  it('submits form with valid token and password', async () => {
    render(<NewPasswordForm />);

    const passwordInput = screen.getByPlaceholderText('placeholders.password');
    const submitButton = screen.getByText('actions.resetPassword');

    fireEvent.change(passwordInput, { target: { value: 'ValidPassword123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authClient.resetPassword).toHaveBeenCalledWith(
        {
          token: 'test-token',
          newPassword: 'ValidPassword123!',
        },
        expect.objectContaining({
          onRequest: expect.any(Function),
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });
  });

  it('validates password field', async () => {
    render(<NewPasswordForm />);
    const submitButton = screen.getByText('actions.resetPassword');

    // Intento de envío sin contraseña
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('placeholders.password')).toBeInvalid();
    });
  });

  it('disables button during submission', async () => {
    render(<NewPasswordForm />);
    const passwordInput = screen.getByPlaceholderText('placeholders.password');
    const submitButton = screen.getByText('actions.resetPassword');

    fireEvent.change(passwordInput, { target: { value: 'ValidPassword123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('has correct back button link', () => {
    render(<NewPasswordForm />);

    const backButton = screen.getByText('rememberPassword');
    expect(backButton).toBeInTheDocument();
    expect(backButton.closest('a')).toHaveAttribute('href', '/auth/login');
  });

  it('does not submit form when token is missing', async () => {
    // Simular falta de token
    jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValueOnce(null);

    render(<NewPasswordForm />);
    const submitButton = screen.getByText('actions.resetPassword');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authClient.resetPassword).not.toHaveBeenCalled();
    });
  });
});
