import React, { type JSX, type ReactNode } from 'react';
import clsx from 'clsx';

interface LabelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
  children: ReactNode;
  className?: string;
}

const Label = ({ as: Comp = 'label', children, className = '' }: LabelProps) => {
  return <Comp className={clsx('rte-label', className)}>{children}</Comp>;
};

export default Label;
