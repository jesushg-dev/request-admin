'use client';

import React, { FC, PropsWithChildren } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ConditionalDialogProps extends PropsWithChildren {
  isDialog?: boolean;
  trigger?: React.ReactNode;
  title?: string;
  onClose?: () => void;
}

const ConditionalDialogWrapper: FC<ConditionalDialogProps> = ({ isDialog = false, trigger, title, onClose, children }) => {
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
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConditionalDialogWrapper;
