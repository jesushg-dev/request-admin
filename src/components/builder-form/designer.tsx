'use client';

import React, { useState } from 'react';
import { DragEndEvent, useDndMonitor, useDraggable, useDroppable } from '@dnd-kit/core';
import { useTranslations } from 'next-intl';
import { BiBookAlt, BiSolidTrash } from 'react-icons/bi';
import { RiDragMove2Line } from 'react-icons/ri';
import { v4 as idGenerator } from 'uuid';

import { cn } from '@/lib/utils';
import useDesigner from '@/hooks/use-designer';

import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import DesignerSidebar from './designer-sidebar';
import { ElementsType, FormElementInstance, FormElements, styleElements } from './form-elements';

function Designer() {
  const t = useTranslations('component.formBuilder'); // Translation namespace
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
            'm-auto flex h-full max-w-[920px] flex-1 flex-grow flex-col items-center justify-start overflow-y-auto rounded-xl bg-background',
            droppable.isOver && 'ring-4 ring-inset ring-primary'
          )}>
          {/* Empty State - No Elements */}
          {!droppable.isOver && elements.length === 0 && <p className="w-full py-10 text-center text-3xl font-bold text-muted-foreground">{t('dropHere')}</p>}

          {/* Droppable Area Highlight */}
          {droppable.isOver && elements.length === 0 && (
            <div className="w-full p-4">
              <div className="h-[120px] rounded-md bg-primary/20"></div>
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
  const t = useTranslations('component.formBuilder');
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
      className="relative flex flex-col overflow-hidden rounded-md border-2 border-dashed text-foreground hover:cursor-pointer"
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}>
      {/* Top Half */}
      <div ref={topHalf.setNodeRef} className="absolute h-1/2 w-full rounded-t-md" />

      {/* Bottom Half */}
      <div ref={bottomHalf.setNodeRef} className="absolute bottom-0 h-1/2 w-full rounded-b-md" />

      {mouseIsOver && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md ring-1 ring-border">
          <div className="absolute inset-0 isolate flex flex-col bg-background/80 opacity-100 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-muted/20" />

          <div className="z-20 flex items-center justify-center gap-2 text-primary">
            <RiDragMove2Line />
            <p className="text-sm">{t('dragToMove')}</p>
          </div>

          {/* Actions */}
          <div className="absolute right-0 top-0 z-50 flex flex-row items-center gap-2 p-1 shadow-sm">
            {/* Properties Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(element);
              }}>
              {t('properties')}
              <BiBookAlt />
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
              <BiSolidTrash />
            </Button>
          </div>
        </div>
      )}

      {/* Top Drag Indicator */}
      {topHalf.isOver && <div className="absolute top-0 h-[7px] w-full rounded-md rounded-b-none bg-primary" />}

      {/* Content */}
      <div className={cn('pointer-events-none flex h-[120px] w-full items-center rounded-md bg-muted/40 px-4 py-2 opacity-100', mouseIsOver && 'opacity-30')}>
        <DesignerElement elementInstance={element} />
      </div>

      {/* Bottom Drag Indicator */}
      {bottomHalf.isOver && <div className="absolute bottom-0 h-[7px] w-full rounded-md rounded-t-none bg-primary" />}
    </div>
  );
}

export default Designer;
