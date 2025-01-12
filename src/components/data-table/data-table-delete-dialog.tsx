'use client';

import * as React from 'react';
import { type Row } from '@tanstack/react-table';
import { Loader, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

interface DataTableDeleteDialogProps<T> extends React.ComponentPropsWithoutRef<typeof Dialog> {
  items: Row<T>['original'][]; // Items to be deleted
  entityLabel: string; // Singular label for the entity (e.g., "task")
  showTrigger?: boolean; // Show the delete button trigger
  onDelete: () => Promise<void>; // Function to handle deletion logic
}

export function DataTableDeleteDialog<T>({ items, entityLabel, showTrigger = true, onDelete, ...props }: DataTableDeleteDialogProps<T>) {
  const [isDeletePending, startDeleteTransition] = React.useTransition();
  const isDesktop = useMediaQuery('(min-width: 640px)');
  const t = useTranslations('table');

  const handleDelete = () => {
    startDeleteTransition(async () => {
      try {
        await onDelete();
        props.onOpenChange?.(false);
        toast.success(t('delete.success', { count: items.length, entity: entityLabel }));
      } catch {
        toast.error(t('delete.error', { entity: entityLabel }));
      }
    });
  };

  const content = (
    <>
      <DialogHeader>
        <DialogTitle>{t('delete.title')}</DialogTitle>
        <DialogDescription>
          {t('delete.description', {
            count: items.length,
            entity: entityLabel,
          })}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2 sm:space-x-0">
        <DialogClose asChild>
          <Button variant="outline">{t('delete.cancel')}</Button>
        </DialogClose>
        <Button aria-label={t('delete.confirm')} variant="destructive" onClick={handleDelete} disabled={isDeletePending}>
          {isDeletePending && <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />}
          {t('delete.confirm')}
        </Button>
      </DialogFooter>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog {...props}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Trash className="mr-2 size-4" aria-hidden="true" />
              {t('delete.trigger', { count: items.length, entity: entityLabel })}
            </Button>
          </DialogTrigger>
        )}
        <DialogContent>{content}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer {...props}>
      {showTrigger && (
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash className="mr-2 size-4" aria-hidden="true" />
            {t('delete.trigger', { count: items.length, entity: entityLabel })}
          </Button>
        </DrawerTrigger>
      )}
      <DrawerContent>{content}</DrawerContent>
    </Drawer>
  );
}
