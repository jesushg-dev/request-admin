import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import LoginForm from './page';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock i18n routing
jest.mock('@/i18n/routing', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}));

// Mock auth client
jest.mock('@/server/auth-client', () => ({
  authClient: {
    twoFactor: {
      verifyTotp: jest.fn().mockResolvedValue({}),
      verifyOtp: jest.fn().mockResolvedValue({}),
    },
  },
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: jest.fn(() => 'toast-id'),
}));

describe('TwoFactorForm', () => {
  it('renders 2FA form correctly', () => {
    render(<LoginForm />);

    expect(screen.getByText('headerTitle')).toBeInTheDocument();
    expect(screen.getByText('headerLabel')).toBeInTheDocument();
    expect(screen.getByText('selectMethod')).toBeInTheDocument();
    expect(screen.getByText('insertCode')).toBeInTheDocument();
    expect(screen.getByText('actions.login')).toBeInTheDocument();
  });

  it('handles verification code input', () => {
    render(<LoginForm />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '123456' } });
    expect(input).toHaveValue('123456');
  });

  it('switches between authentication methods', () => {
    render(<LoginForm />);

    const authenticatorRadio = screen.getByRole('radio', { name: /authenticator/i });
    const emailRadio = screen.getByRole('radio', { name: /email/i });

    expect(authenticatorRadio).toHaveAttribute('aria-checked', 'false');
    expect(emailRadio).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(emailRadio);
    expect(emailRadio).toHaveAttribute('aria-checked', 'true');
    expect(authenticatorRadio).toHaveAttribute('aria-checked', 'false');
  });

  it('handles form submission with authenticator method', async () => {
    render(<LoginForm />);

    const input = screen.getByRole('textbox');
    const submitButton = screen.getByText('actions.login');

    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('handles form submission with email method', async () => {
    render(<LoginForm />);

    const input = screen.getByRole('textbox');
    const submitButton = screen.getByText('actions.login');
    const emailRadio = screen.getByRole('radio', { name: /email/i });

    fireEvent.click(emailRadio);
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
