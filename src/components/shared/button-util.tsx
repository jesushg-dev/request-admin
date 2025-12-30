import { type FC } from 'react';

import { Button, type ButtonProps } from '../ui/button';

interface ButtonLoadingProps extends ButtonProps {
  isLoading: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const ButtonLoading: FC<ButtonLoadingProps> = ({ children, disabled, isLoading, ...props }) => {
  return (
    <Button type="submit" variant="secondary" size="sm" {...props} disabled={disabled || isLoading}>
      {children}
    </Button>
  );
};
