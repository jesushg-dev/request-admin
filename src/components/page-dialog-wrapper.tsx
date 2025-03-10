'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PageDialogWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function PageDialogWrapper({ title, description, children, className }: PageDialogWrapperProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      router.back();
    }, 450);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className={cn('max-h-[calc(100vh-2rem)]', 'flex flex-col overflow-hidden', className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <div className="flex flex-1 flex-col justify-between overflow-hidden px-1">{children}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
