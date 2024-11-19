'use client';

import React, { Suspense } from 'react';
import { Dialog, DialogContent } from '@radix-ui/react-dialog';
import LoadingSpinner from '../LoadingSpinner';
import { cn } from '@/services/lib/utils';

interface PageOrModalProps {
  children: React.ReactNode;
  isModal?: boolean;
  isLoading?: boolean;
  onClose?: () => void;
  className?: string;
}

export const PageOrModal: React.FC<PageOrModalProps> = ({ children, isModal = false, isLoading = false, onClose, className }) => {
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isModal) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose?.()}>
        <DialogContent className={cn('max-w-3xl', className)}>
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="p-4">
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </div>
  );
};
