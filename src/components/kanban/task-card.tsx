import { memo } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import { GripVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { Badge } from '../ui/badge';
import { ColumnId } from './kanban-board';

export interface Task {
  id: UniqueIdentifier;
  columnId: ColumnId;
  content: string;
}

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export type TaskType = 'Task';

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isOverlay }) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: 'Task',
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva('', {
    variants: {
      dragging: {
        over: 'opacity-30 ring-2',
        overlay: 'ring-primary ring-2',
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
      <CardHeader className="space-between flex flex-row items-center border-b-2 p-2 text-left font-semibold">
        <Button variant={'ghost'} {...attributes} {...listeners} className="text-primary/50 relative mb-0 h-6 w-6 cursor-grab">
          <span className="sr-only">Move task</span>
          <GripVertical />
        </Button>
        <Badge variant={'outline'} className="ml-auto text-xs font-semibold">
          Task
        </Badge>
      </CardHeader>
      <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap">{task.content}</CardContent>
    </Card>
  );
};

export default memo(TaskCard);
