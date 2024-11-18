import React from 'react';
import type { FC } from 'react';
import { twMerge } from 'tailwind-merge';

interface IScrollableProps {
  children: React.ReactNode;
  className?: string;
}

const Scrollable: FC<IScrollableProps> = ({ children, className }) => {
  return (
    <div className="relative flex-1">
      <div className="absolute inset-0 flex flex-col overflow-y-hidden">
        <div className={twMerge('overflow-y-auto', className)}>{children}</div>
      </div>
    </div>
  );
};

export default Scrollable;
