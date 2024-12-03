import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';

import useDesigner from '@/hooks/use-designer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { FormElements } from './form-elements';

function PropertiesFormSidebar() {
  const { selectedElement, setSelectedElement } = useDesigner();
  if (!selectedElement) return null;

  const PropertiesForm = FormElements[selectedElement?.type].propertiesComponent;

  return (
    <div className="flex flex-col p-2">
      <div className="flex items-center justify-between">
        <p className="text-textPrimary text-sm">Element properties</p>
        <Button
          size={'icon'}
          variant={'ghost'}
          onClick={() => {
            setSelectedElement(null);
          }}>
          <AiOutlineClose />
        </Button>
      </div>
      <Separator className="mb-4" />
      <PropertiesForm elementInstance={selectedElement} />
    </div>
  );
}

export default PropertiesFormSidebar;
