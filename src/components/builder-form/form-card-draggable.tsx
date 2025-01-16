'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Form } from '@prisma/client';

import { cn } from '@/lib/utils';

interface FormCardProps {
  children: React.ReactNode;
  form: Form;
}

export function FormCardDraggable({ children, form }: FormCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: form.id,
    data: form,
  });

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} className={cn('relative cursor-move touch-none', isDragging && 'opacity-50')} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
