'use client';

import { CircleXIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import useDesigner from '@/hooks/use-designer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { ScrollArea } from '../ui/scroll-area';
import { FormElements } from './form-elements';

function PropertiesFormSidebar() {
  const t = useTranslations('component.form');
  const { selectedElement, setSelectedElement } = useDesigner();
  if (!selectedElement) return null;

  const PropertiesForm = FormElements[selectedElement?.type].propertiesComponent;

  return (
    <ScrollArea className="p-4">
      <div className="flex flex-col p-2">
        <div className="flex items-center justify-between">
          <p className="text-textPrimary text-sm">{t('elementProperties')}</p>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setSelectedElement(null);
            }}>
            <CircleXIcon />
          </Button>
        </div>
        <Separator className="mb-4" />
        <PropertiesForm elementInstance={selectedElement} />
      </div>
    </ScrollArea>
  );
}

export default PropertiesFormSidebar;
