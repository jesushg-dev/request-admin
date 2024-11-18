import React, { FC } from 'react';
import useDesigner from '@/hooks/use-designer.hook';
import FormElementsSidebar from './FormElementsSidebar';
import PropertiesFormSidebar from './PropertiesFormSidebar';

const DesignerSidebar: FC = () => {
  const { selectedElement } = useDesigner();

  return (
    <aside className="flex h-full w-[400px] max-w-[400px] flex-grow flex-col gap-2 overflow-y-auto border-l-2 border-muted bg-background p-4">
      {selectedElement ? <PropertiesFormSidebar /> : <FormElementsSidebar />}
    </aside>
  );
};

export default DesignerSidebar;
