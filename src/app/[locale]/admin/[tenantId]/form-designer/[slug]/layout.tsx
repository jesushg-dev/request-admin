import React, { type ReactNode } from 'react';

import DesignerContextProvider from '@/components/hoc/designer-context';

function layout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full grow flex-col">
      <DesignerContextProvider>{children}</DesignerContextProvider>
    </div>
  );
}

export default layout;
