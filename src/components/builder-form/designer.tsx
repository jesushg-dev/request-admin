'use client';

import React, { useState } from 'react';
import { DragEndEvent, useDndMonitor, useDraggable, useDroppable } from '@dnd-kit/core';
import { BiBookAlt, BiSolidTrash } from 'react-icons/bi';
import { RiDragMove2Line } from 'react-icons/ri';
import { v4 as idGenerator } from 'uuid';

import { cn } from '@/lib/utils';
import useDesigner from '@/hooks/use-designer';

import { Button } from '../form';
import DesignerSidebar from './designer-sidebar';
import { ElementsType, FormElementInstance, FormElements, styleElements } from './form-elements';

function Designer() {
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

      // First scenario
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

      // Second scenario
      if (droppingSidebarBtnOverDesignerElement) {
        const type = active.data?.current?.type;
        const newElement = FormElements[type as ElementsType].construct(idGenerator());

        const overId = over.data?.current?.elementId;

        const overElementIndex = elements.findIndex((el) => el.id === overId);
        if (overElementIndex === -1) {
          throw new Error('element not found');
        }

        let indexForNewElement = overElementIndex; // i assume i'm on top-half
        if (isDroppingOverDesignerElementBottomHalf) {
          indexForNewElement = overElementIndex + 1;
        }

        addElement(indexForNewElement, newElement);
        return;
      }

      // Third scenario
      const isDraggingDesignerElement = active.data?.current?.isDesignerElement;

      const draggingDesignerElementOverAnotherDesignerElement = isDroppingOverDesignerElement && isDraggingDesignerElement;

      if (draggingDesignerElementOverAnotherDesignerElement) {
        const activeId = active.data?.current?.elementId;
        const overId = over.data?.current?.elementId;

        const activeElementIndex = elements.findIndex((el) => el.id === activeId);

        const overElementIndex = elements.findIndex((el) => el.id === overId);

        if (activeElementIndex === -1 || overElementIndex === -1) {
          throw new Error('element not found');
        }

        const activeElement = { ...elements[activeElementIndex] };

        if (activeElement.id && activeElement.extraAttributes) {
          removeElement(activeId);

          let indexForNewElement = overElementIndex; // i assume i'm on top-half
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
      <div
        className="w-full p-4"
        onClick={() => {
          if (selectedElement) setSelectedElement(null);
        }}>
        <div
          ref={droppable.setNodeRef}
          className={cn(
            'm-auto flex h-full max-w-[920px] flex-1 flex-grow flex-col items-center justify-start overflow-y-auto rounded-xl bg-background',
            droppable.isOver && 'ring-4 ring-inset ring-primary'
          )}>
          {!droppable.isOver && elements.length === 0 && <p className="flex flex-grow items-center text-3xl font-bold text-muted-foreground">Drop here</p>}

          {droppable.isOver && elements.length === 0 && (
            <div className="w-full p-4">
              <div className="h-[120px] rounded-md bg-primary/20"></div>
            </div>
          )}
          {elements.length > 0 && (
            <div className="flex w-full flex-col gap-2 p-4">
              {elements.map((element) => (
                <DesignerElementWrapper key={element.id} element={element} />
              ))}
            </div>
          )}
        </div>
      </div>
      <DesignerSidebar />
    </div>
  );
}

function DesignerElementWrapper({ element }: { element: FormElementInstance }) {
  const styles = styleElements[element.type];

  const { removeElement, selectedElement, setSelectedElement } = useDesigner();

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

  if (draggable.isDragging) return null; // temporary remove the element from designer

  const DesignerElement = FormElements[element.type].designerComponent;
  return (
    <div
      ref={draggable.setNodeRef}
      {...draggable.listeners}
      {...draggable.attributes}
      style={styles}
      className="text-textPrimary relative flex flex-col overflow-hidden rounded-md border-2 border-dashed hover:cursor-pointer"
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
      /* onClick={(e) => {
        e.stopPropagation();
        setSelectedElement(element);
      }}*/
    >
      <div ref={topHalf.setNodeRef} className="absolute h-1/2 w-full rounded-t-md" />
      <div ref={bottomHalf.setNodeRef} className="absolute bottom-0 h-1/2 w-full rounded-b-md" />
      {mouseIsOver && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md ring-1 ring-primary">
          <div className="absolute inset-0 isolate flex flex-col bg-white bg-opacity-80 opacity-100 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-primary bg-opacity-20" />

          <div className="z-20 flex items-center justify-center gap-2 text-primary">
            <RiDragMove2Line />
            <p className="text-sm">Keep press here and drag to move</p>
          </div>

          <div className="shadow-3 absolute right-0 top-0 z-50 flex flex-row items-center gap-2 p-1">
            <Button
              className="px-2 py-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(element);
              }}>
              Properties
              <BiBookAlt />
            </Button>

            <Button
              className="bg-red-500 px-2 py-1 text-xs hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                removeElement(element.id);
              }}>
              Delete
              <BiSolidTrash />
            </Button>
          </div>
        </div>
      )}
      {topHalf.isOver && <div className="absolute top-0 h-[7px] w-full rounded-md rounded-b-none bg-primary" />}
      <div className={cn('pointer-events-none flex h-[120px] w-full items-center rounded-md bg-accent/40 px-4 py-2 opacity-100', mouseIsOver && 'opacity-30')}>
        <DesignerElement elementInstance={element} />
      </div>
      {bottomHalf.isOver && <div className="absolute bottom-0 h-[7px] w-full rounded-md rounded-t-none bg-primary" />}
    </div>
  );
}

export default Designer;
