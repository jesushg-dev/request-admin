import React, { type FC } from 'react';
import Skeleton from 'react-loading-skeleton';

// Props type definition for clarity and type checking
interface HandleListStateProps {
  isLoading: boolean | undefined;
  isError: boolean;
  isEmpty: boolean;
  children: JSX.Element;
  skeleton?: JSX.Element; // Optional, custom skeleton loader
  errorComponent?: JSX.Element; // Optional, custom error component
  emptyComponent?: JSX.Element; // Optional, custom empty component
}

const HandleDataState: FC<HandleListStateProps> = ({ isLoading, isError, isEmpty, children, skeleton, errorComponent = 'Error loading data. Please try again.', emptyComponent = 'No data available.' }) => {
  if (isLoading) {
    return skeleton || <Skeleton count={5} />;
  }

  if (isError) {
    return <>{errorComponent}</>;
  }

  if (isEmpty) {
    return <>{emptyComponent}</>;
  }

  return children;
};

export default HandleDataState;
