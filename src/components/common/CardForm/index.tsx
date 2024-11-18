import React from 'react';
import type { FC } from 'react';
import type { ClassValue } from 'clsx';
import { cn } from '@/services/lib/utils';

interface ICardFormProps {
  header?: React.ReactNode;
  children?: React.ReactNode;
  className?: ClassValue;
}

const CardForm: FC<ICardFormProps> = ({ header, children, className }) => {
  return (
    <div className={cn('border-stroke shadow-default dark:border-strokedark dark:bg-boxdark flex flex-1 flex-col rounded-sm border bg-white', className)}>
      {header && <div className="border-stroke dark:border-strokedark border-b px-6 py-4">{header}</div>}
      {children}
    </div>
  );
};

export default CardForm;
