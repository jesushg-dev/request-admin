import React, { type ReactNode } from 'react';

function layout({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full flex-grow flex-col">{children}</div>;
}

export default layout;
