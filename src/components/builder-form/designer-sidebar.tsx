import React, { FC } from 'react';

import useDesigner from '@/hooks/use-designer';

import FormElementsSidebar from './form-elements-sidebar';
import PropertiesFormSidebar from './properties-form-sidebar';

const DesignerSidebar: FC = () => {
  const { selectedElement } = useDesigner();

  return (
    <aside className="border-muted bg-background flex h-full w-[400px] max-w-[400px] grow flex-col gap-2 overflow-y-hidden border-l-2">
      {selectedElement ? <PropertiesFormSidebar /> : <FormElementsSidebar />}
    </aside>
  );
};

export default DesignerSidebar;
