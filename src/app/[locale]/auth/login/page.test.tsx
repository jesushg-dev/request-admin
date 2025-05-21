import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import LoginForm from './page';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock i18n routing
jest.mock('@/i18n/routing', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock auth client
jest.mock('@/server/auth-client', () => ({
  authClient: {
    signIn: {
      email: jest.fn().mockResolvedValue({ data: { twoFactorRedirect: false } }),
    },
  },
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: jest.fn(() => 'toast-id'),
}));

describe('LoginForm', () => {
  it('renders login form correctly', () => {
    render(<LoginForm />);

    expect(screen.getByPlaceholderText('placeholders.email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholders.password')).toBeInTheDocument();
    expect(screen.getByText('actions.login')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('placeholders.email');
    const passwordInput = screen.getByPlaceholderText('placeholders.password');
    const submitButton = screen.getByText('actions.login');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('shows error banner when error query param is present', () => {
    jest.spyOn(URLSearchParams.prototype, 'get').mockImplementation((key) => {
      if (key === 'error') return 'unauthenticated';
      return null;
    });

    render(<LoginForm />);

    expect(screen.getByText('errors.unauthenticated')).toBeInTheDocument();
    expect(screen.getByText('errors.unauthenticatedDescription')).toBeInTheDocument();
  });

  it('handles remember me checkbox', () => {
    render(<LoginForm />);

    const rememberCheckbox = screen.getByLabelText('fields.remember');
    expect(rememberCheckbox).not.toBeChecked();

    fireEvent.click(rememberCheckbox);
    expect(rememberCheckbox).toBeChecked();
  });

  it('validates email format', () => {
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('placeholders.email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    expect(emailInput).toBeInvalid();
  });

  it('toggles password visibility', async () => {
    render(<LoginForm />);

    const passwordInput = screen.getByPlaceholderText('placeholders.password');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    fireEvent.change(passwordInput, { target: { value: 'test123' } });
    expect(passwordInput).toHaveAttribute('type', 'password');

    await waitFor(() => {
      expect(toggleButton).not.toBeDisabled();
    });

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
    });
  });

  it('handles forgot password link', () => {
    render(<LoginForm />);

    const forgotPasswordLink = screen.getByText('forgotPassword');
    expect(forgotPasswordLink).toBeInTheDocument();
  });

  it('handles no account link', () => {
    render(<LoginForm />);

    const noAccountLink = screen.getByText('noAccount');
    expect(noAccountLink).toBeInTheDocument();
  });

  it('displays header content', () => {
    render(<LoginForm />);

    expect(screen.getByText('headerTitle')).toBeInTheDocument();
    expect(screen.getByText('headerLabel')).toBeInTheDocument();
  });
});
