import React from 'react';
import type { FC } from 'react';

interface ILoadingComponentProps {}

const LoadingComponent: FC<ILoadingComponentProps> = ({}) => {
  return (
    <div className="flex h-full w-full rounded-md bg-white p-5 text-gray-600 ring-2 ring-blue-100 transition-all">
      <div className="flex flex-col gap-1">
        <Skeleton width={100} height={20} />
        <Skeleton width={150} height={10} />
      </div>
    </div>
  );
};

export default LoadingComponent;
