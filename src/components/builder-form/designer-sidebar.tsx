import React, { FC } from 'react';

import useDesigner from '@/hooks/use-designer';

import FormElementsSidebar from './form-elements-sidebar';
import PropertiesFormSidebar from './properties-form-sidebar';

const DesignerSidebar: FC = () => {
  const { selectedElement } = useDesigner();

  return (
    <aside className="flex h-full w-[400px] max-w-[400px] flex-grow flex-col gap-2 overflow-y-hidden border-l-2 border-muted bg-background">
      {selectedElement ? <PropertiesFormSidebar /> : <FormElementsSidebar />}
    </aside>
  );
};

export default DesignerSidebar;
