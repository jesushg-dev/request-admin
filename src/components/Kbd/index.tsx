import React from 'react';
import type { FC } from 'react';
import { twMerge } from 'tailwind-merge';

interface IKbdProps extends React.HTMLAttributes<HTMLElement> {}

const Kbd: FC<IKbdProps> = (props) => {
  return (
    <kbd
      {...props}
      className={twMerge(
        'rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-800 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-100',
        props.className
      )}>
      {props.children}
    </kbd>
  );
};

export default Kbd;
