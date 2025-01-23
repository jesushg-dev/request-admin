import { useMemo } from 'react';
import { useDndContext, type UniqueIdentifier } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { cva } from 'class-variance-authority';
import { GripVertical } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { ScrollBar } from '../ui/scroll-area';
import { Task, TaskCard } from './task-card';

export interface Column {
  id: UniqueIdentifier;
  title: string;
}

export type ColumnType = 'Column';

export interface ColumnDragData {
  type: ColumnType;
  column: Column;
}

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  isOverlay?: boolean;
}

export function BoardColumn({ column, tasks, isOverlay }: BoardColumnProps) {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    } satisfies ColumnDragData,
    attributes: {
      roleDescription: `Column: ${column.title}`,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva('min-w-3xs flex max-w-full flex-1 flex-shrink-0 snap-center flex-col bg-primary-foreground', {
    variants: {
      dragging: {
        default: 'border-2 border-transparent',
        over: 'opacity-30 ring-2',
        overlay: 'ring-2 ring-primary',
      },
    },
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
      })}>
      <CardHeader className="space-between flex flex-row items-center border-b-2 p-4 text-left font-semibold">
        <Button variant={'ghost'} {...attributes} {...listeners} className="relative -ml-2 h-auto cursor-grab p-1 text-primary/50">
          <span className="sr-only">{`Move column: ${column.title}`}</span>
          <GripVertical />
        </Button>
        <span className="ml-auto"> {column.title}</span>
      </CardHeader>
      <ScrollArea>
        <CardContent className="flex flex-grow flex-col gap-2 p-2">
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
  const dndContext = useDndContext();

  const variations = cva('flex w-full flex-1 overflow-y-hidden lg:justify-center', {
    variants: {
      dragging: {
        default: 'snap-x snap-mandatory',
        active: 'snap-none',
      },
    },
  });

  return (
    <ScrollArea
      className={variations({
        dragging: dndContext.active ? 'active' : 'default',
      })}>
      {children}
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
