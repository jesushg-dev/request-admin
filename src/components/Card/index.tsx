import React, { FC } from 'react';

import { twMerge } from 'tailwind-merge';

interface ICardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: FC<ICardProps> = (props) => {
  const { children, className } = props;

  return (
    <div {...props} className={twMerge('border-stroke shadow-default dark:border-strokedark dark:bg-boxdark rounded-sm border', className)}>
      {children}
    </div>
  );
};

const CardHeader: FC<ICardProps> = (props) => {
  const { children, className } = props;

  return (
    <div className={twMerge('border-stroke dark:border-strokedark border-b px-6 py-4', className)}>
      <h3 className="font-medium text-black dark:text-white">{children}</h3>
    </div>
  );
};

export { CardHeader };
export default Card;
