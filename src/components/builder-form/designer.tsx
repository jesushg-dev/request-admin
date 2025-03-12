'use client';

import React, { useState } from 'react';
import { DragEndEvent, useDndMonitor, useDraggable, useDroppable } from '@dnd-kit/core';
import { BookIcon, MoveIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { v4 as idGenerator } from 'uuid';

import { cn } from '@/lib/utils';
import useDesigner from '@/hooks/use-designer';

import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import DesignerSidebar from './designer-sidebar';
import { ElementsType, FormElementInstance, FormElements, styleElements } from './form-elements';

function Designer() {
  const t = useTranslations('component.form'); // Translation namespace
  const { elements, addElement, selectedElement, setSelectedElement, removeElement } = useDesigner();

  const droppable = useDroppable({
    id: 'designer-drop-area',
    data: {
      isDesignerDropArea: true,
    },
  });

  useDndMonitor({
    onDragEnd: (event: DragEndEvent) => {
      const { active, over } = event;
      if (!active || !over) return;

      const isDesignerBtnElement = active.data?.current?.isDesignerBtnElement;
      const isDroppingOverDesignerDropArea = over.data?.current?.isDesignerDropArea;

      const droppingSidebarBtnOverDesignerDropArea = isDesignerBtnElement && isDroppingOverDesignerDropArea;

      if (droppingSidebarBtnOverDesignerDropArea) {
        const type = active.data?.current?.type;
        const newElement = FormElements[type as ElementsType].construct(idGenerator());

        addElement(elements.length, newElement);
        return;
      }

      const isDroppingOverDesignerElementTopHalf = over.data?.current?.isTopHalfDesignerElement;
      const isDroppingOverDesignerElementBottomHalf = over.data?.current?.isBottomHalfDesignerElement;
      const isDroppingOverDesignerElement = isDroppingOverDesignerElementTopHalf || isDroppingOverDesignerElementBottomHalf;

      const droppingSidebarBtnOverDesignerElement = isDesignerBtnElement && isDroppingOverDesignerElement;

      if (droppingSidebarBtnOverDesignerElement) {
        const type = active.data?.current?.type;
        const newElement = FormElements[type as ElementsType].construct(idGenerator());

        const overId = over.data?.current?.elementId;

        const overElementIndex = elements.findIndex((el) => el.id === overId);
        if (overElementIndex === -1) {
          throw new Error(t('errors.elementNotFound'));
        }

        let indexForNewElement = overElementIndex;
        if (isDroppingOverDesignerElementBottomHalf) {
          indexForNewElement = overElementIndex + 1;
        }

        addElement(indexForNewElement, newElement);
        return;
      }

      const isDraggingDesignerElement = active.data?.current?.isDesignerElement;
      const draggingDesignerElementOverAnotherDesignerElement = isDroppingOverDesignerElement && isDraggingDesignerElement;

      if (draggingDesignerElementOverAnotherDesignerElement) {
        const activeId = active.data?.current?.elementId;
        const overId = over.data?.current?.elementId;

        const activeElementIndex = elements.findIndex((el) => el.id === activeId);
        const overElementIndex = elements.findIndex((el) => el.id === overId);

        if (activeElementIndex === -1 || overElementIndex === -1) {
          throw new Error(t('errors.elementNotFound'));
        }

        const activeElement = { ...elements[activeElementIndex] };

        if (activeElement.id && activeElement.extraAttributes) {
          removeElement(activeId);

          let indexForNewElement = overElementIndex;
          if (isDroppingOverDesignerElementBottomHalf) {
            indexForNewElement = overElementIndex + 1;
          }

          addElement(indexForNewElement, activeElement as FormElementInstance);
        }
      }
    },
  });

  return (
    <div className="flex h-full w-full">
      {/* Main Content Area */}
      <div
        className="w-full p-4"
        onClick={() => {
          if (selectedElement) setSelectedElement(null);
        }}>
        <ScrollArea
          ref={droppable.setNodeRef}
          className={cn(
            'bg-background m-auto flex h-full max-w-[920px] flex-1 grow flex-col items-center justify-start overflow-y-auto rounded-xl',
            droppable.isOver && 'ring-primary ring-4 ring-inset'
          )}>
          {/* Empty State - No Elements */}
          {!droppable.isOver && elements.length === 0 && <p className="text-muted-foreground w-full py-10 text-center text-3xl font-bold">{t('dropHere')}</p>}

          {/* Droppable Area Highlight */}
          {droppable.isOver && elements.length === 0 && (
            <div className="w-full p-4">
              <div className="bg-primary/20 h-[120px] rounded-md"></div>
            </div>
          )}

          {/* Render Elements */}
          {elements.length > 0 && (
            <div className="flex w-full flex-col gap-2 p-4">
              {elements.map((element) => (
                <DesignerElementWrapper key={element.id} element={element} />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Sidebar */}
      <DesignerSidebar />
    </div>
  );
}

function DesignerElementWrapper({ element }: { element: FormElementInstance }) {
  const t = useTranslations('component.form');
  const styles = styleElements[element.type];

  const { removeElement, setSelectedElement } = useDesigner();

  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);
  const topHalf = useDroppable({
    id: element.id + '-top',
    data: {
      type: element.type,
      elementId: element.id,
      isTopHalfDesignerElement: true,
    },
  });

  const bottomHalf = useDroppable({
    id: element.id + '-bottom',
    data: {
      type: element.type,
      elementId: element.id,
      isBottomHalfDesignerElement: true,
    },
  });

  const draggable = useDraggable({
    id: element.id + '-drag-handler',
    data: {
      type: element.type,
      elementId: element.id,
      isDesignerElement: true,
    },
  });

  if (draggable.isDragging) return null;

  const DesignerElement = FormElements[element.type].designerComponent;
  return (
    <div
      ref={draggable.setNodeRef}
      {...draggable.listeners}
      {...draggable.attributes}
      style={styles}
      className="text-foreground relative flex flex-col overflow-hidden rounded-md border-2 border-dashed hover:cursor-pointer"
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}>
      {/* Top Half */}
      <div ref={topHalf.setNodeRef} className="absolute h-1/2 w-full rounded-t-md" />

      {/* Bottom Half */}
      <div ref={bottomHalf.setNodeRef} className="absolute bottom-0 h-1/2 w-full rounded-b-md" />

      {mouseIsOver && (
        <div className="ring-border absolute inset-0 flex items-center justify-center rounded-md ring-1">
          <div className="bg-background/80 absolute inset-0 isolate flex flex-col opacity-100 transition-opacity" />
          <div className="bg-muted/20 absolute inset-0 flex items-center justify-center rounded-md" />

          <div className="text-primary z-20 flex items-center justify-center gap-2">
            <MoveIcon />
            <p className="text-sm">{t('dragToMove')}</p>
          </div>

          {/* Actions */}
          <div className="absolute top-0 right-0 z-50 flex flex-row items-center gap-2 p-1 shadow-xs">
            {/* Properties Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(element);
              }}>
              {t('properties')}
              <BookIcon />
            </Button>

            {/* Delete Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeElement(element.id);
              }}>
              {t('delete')}
              <Trash2Icon />
            </Button>
          </div>
        </div>
      )}

      {/* Top Drag Indicator */}
      {topHalf.isOver && <div className="bg-primary absolute top-0 h-[7px] w-full rounded-md rounded-b-none" />}

      {/* Content */}
      <div className={cn('bg-muted/40 pointer-events-none flex h-[120px] w-full items-center rounded-md px-4 py-2 opacity-100', mouseIsOver && 'opacity-30')}>
        <DesignerElement elementInstance={element} />
      </div>

      {/* Bottom Drag Indicator */}
      {bottomHalf.isOver && <div className="bg-primary absolute bottom-0 h-[7px] w-full rounded-md rounded-t-none" />}
    </div>
  );
}

export default Designer;
