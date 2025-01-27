'use client';

import { Link } from '@/i18n/routing';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { LoginForm } from '@/components/auth/login-form';

import { Button } from '../ui/button';

interface LoginButtonProps {
  children: React.ReactNode;
  mode?: 'modal' | 'redirect';
  asChild?: boolean;
}

export const LoginButton = ({ children, mode = 'redirect', asChild }: LoginButtonProps) => {
  if (mode === 'modal') {
    return (
      <Dialog>
        <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
        <DialogContent className="w-auto border-none bg-transparent p-0">
          <LoginForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Button variant="secondary" size="lg" asChild={asChild}>
      <Link href="/auth/login">{children}</Link>
    </Button>
  );
};
