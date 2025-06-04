'use client';

import { ChevronRight, GalleryVerticalIcon, TextCursorInputIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

import { ScrollArea } from '../ui/scroll-area';
import { FormElements } from './form-elements';
import SidebarBtnElement from './sidebar-btn-element';

function FormElementsSidebar() {
  const t = useTranslations('component.form');

  return (
    <ScrollArea className="p-4">
      <div>
        <p className="text-text-textPrimary text-sm">{t('dragDropElements')}</p>
        <Separator className="my-2" />

        <div className="flex flex-col gap-2">
          {/* Form Elements Section */}
          <Collapsible defaultOpen className="group/collapsible">
            <CollapsibleTrigger className="text-muted-foreground flex w-full items-center justify-between gap-2 py-2 text-xs font-medium hover:underline">
              <div className="flex items-center gap-1">
                <TextCursorInputIcon className="h-4 w-4" />
                <span>{t('formElements')}</span>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 flex flex-col gap-1">
              <SidebarBtnElement formElement={FormElements.TextField} />
              <SidebarBtnElement formElement={FormElements.NumberField} />
              <SidebarBtnElement formElement={FormElements.TextAreaField} />
              <SidebarBtnElement formElement={FormElements.DateField} />
              <SidebarBtnElement formElement={FormElements.SelectField} />
              <SidebarBtnElement formElement={FormElements.CheckboxField} />
            </CollapsibleContent>
          </Collapsible>

          {/* Layout Elements Section */}
          <Collapsible defaultOpen className="group/collapsible">
            <CollapsibleTrigger className="text-muted-foreground flex w-full items-center justify-between gap-2 py-2 text-xs font-medium hover:underline">
              <div className="flex items-center gap-1">
                <GalleryVerticalIcon className="h-4 w-4" />
                <span>{t('layoutElements')}</span>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 flex flex-col gap-1">
              <SidebarBtnElement formElement={FormElements.TitleField} />
              <SidebarBtnElement formElement={FormElements.SubTitleField} />
              <SidebarBtnElement formElement={FormElements.ParagraphField} />
              <SidebarBtnElement formElement={FormElements.SeparatorField} />
              <SidebarBtnElement formElement={FormElements.SpacerField} />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </ScrollArea>
  );
}

export default FormElementsSidebar;
