'use client';

import React, { FC, PropsWithChildren } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ConditionalDialogProps extends PropsWithChildren {
  isDialog?: boolean;
  trigger?: React.ReactNode;
  title?: string;
  exitText?: string;
}

const ConditionalDialogWrapper: FC<ConditionalDialogProps> = ({ isDialog = false, trigger, title, exitText, children }) => {
  if (!isDialog) {
    return <>{children}</>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-6xl">
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">{exitText}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConditionalDialogWrapper;
