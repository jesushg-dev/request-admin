import { ReactNode } from 'react';
import { authClient } from '@/server/auth-client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ResetForm from './page';

// Mock authClient
jest.mock('@/server/auth-client', () => ({
  authClient: {
    forgetPassword: jest.fn().mockResolvedValue({}),
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

describe('ResetForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form correctly', () => {
    render(<ResetForm />);

    expect(screen.getByPlaceholderText('placeholders.email')).toBeInTheDocument();
    expect(screen.getByText('actions.sendResetEmail')).toBeInTheDocument();
    expect(screen.getByText('headerTitle')).toBeInTheDocument();
    expect(screen.getByText('headerLabel')).toBeInTheDocument();
  });

  it('submits form with valid email', async () => {
    render(<ResetForm />);

    const emailInput = screen.getByPlaceholderText('placeholders.email');
    const submitButton = screen.getByText('actions.sendResetEmail');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
    expect(authClient.resetPassword).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
          redirectTo: '/auth/new-password',
        },
        expect.objectContaining({
          onRequest: expect.any(Function),
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });
  });

  it('validates required email field', async () => {
    render(<ResetForm />);
    const submitButton = screen.getByText('actions.sendResetEmail');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('placeholders.email')).toBeInvalid();
    });
  });

  it('disables button during submission', async () => {
    render(<ResetForm />);
    const emailInput = screen.getByPlaceholderText('placeholders.email');
    const submitButton = screen.getByText('actions.sendResetEmail');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('has correct back button link', () => {
    render(<ResetForm />);

    const backButton = screen.getByText('noAccount');
    expect(backButton).toBeInTheDocument();
    expect(backButton.closest('a')).toHaveAttribute('href', '/auth/register');
  });
});
