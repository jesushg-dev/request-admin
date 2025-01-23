import { memo, useMemo } from 'react';
import { type UniqueIdentifier } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { cva } from 'class-variance-authority';
import { GripVertical } from 'lucide-react';

import ClientOnly from '../client-only';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { ScrollBar } from '../ui/scroll-area';
import TaskCard, { Task } from './task-card';

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

const variants = cva('bg-primary-foreground flex max-w-full min-w-3xs flex-1 flex-col overflow-hidden', {
  variants: {
    dragging: {
      default: 'border-2 border-transparent',
      over: 'opacity-30 ring-2',
      overlay: 'ring-primary ring-2',
    },
  },
});

const BoardColumn: React.FC<BoardColumnProps> = ({ column, tasks, isOverlay }) => {
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
      })}>
      <CardHeader className="space-between flex flex-row items-center border-b-2 p-2 text-left font-semibold">
        <Button variant={'ghost'} {...attributes} {...listeners} className="text-primary/50 relative mb-0 h-6 w-6 cursor-grab">
          <span className="sr-only">{`Move column: ${column.title}`}</span>
          <GripVertical />
        </Button>
        <span className="ml-auto text-xs"> {column.title}</span>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden p-2">
        <div className="relative flex flex-1 overflow-hidden">
          <div className="absolute inset-0 flex flex-col gap-2 overflow-auto">
            <SortableContext items={tasksIds}>
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </SortableContext>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BoardContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ClientOnly>
      <div className="relative flex flex-1 overflow-hidden">
        <div className="absolute inset-0 flex overflow-hidden">
          <ScrollArea className="flex w-full flex-1 overflow-y-hidden whitespace-nowrap">
            {children}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </ClientOnly>
  );
};

export default memo(BoardColumn);
export { BoardContainer };
