import React, { FC } from 'react';
import { twMerge } from 'tailwind-merge';

interface IButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  children?: React.ReactNode | React.ReactNode[];
}

const Button: FC<IButtonProps> = ({ children, ...rest }) => {
  return (
    <button {...rest} className={twMerge('flex items-center justify-center gap-2 rounded bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90', rest.className)}>
      {children}
    </button>
  );
};

export default Button;
