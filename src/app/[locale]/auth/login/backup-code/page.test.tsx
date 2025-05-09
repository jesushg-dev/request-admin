import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import LoginForm from './page';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  NextIntlClientProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// Mock i18n routing
jest.mock('@/i18n/routing', () => ({
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}));

// Mock auth client
jest.mock('@/server/auth-client', () => ({
  authClient: {
    twoFactor: {
      verifyBackupCode: jest.fn().mockResolvedValue({}),
    },
  },
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: jest.fn(() => 'toast-id'),
}));

describe('BackupCodeForm', () => {
  it('renders backup code form correctly', () => {
    render(<LoginForm />);

    expect(screen.getByText('headerBackupTitle')).toBeInTheDocument();
    expect(screen.getByText('headerLabel')).toBeInTheDocument();
    expect(screen.getByText('actions.login')).toBeInTheDocument();
  });

  it('handles backup code input', () => {
    render(<LoginForm />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '123456' } });
    expect(input).toHaveValue('123456');
  });

  it('handles form submission', async () => {
    render(<LoginForm />);

    const input = screen.getByRole('textbox');
    const submitButton = screen.getByText('actions.login');

    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
