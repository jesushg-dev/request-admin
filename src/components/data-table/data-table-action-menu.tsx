import React from 'react';
import { I18Link, Link } from '@/i18n/routing';
import { CellContext, Row } from '@tanstack/react-table';
import { Ellipsis } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { Button } from '../ui/button';

type ActionCellProps<TData, TValue> = {
  cell: CellContext<TData, TValue>; // The cell context
  onUpdate?: (row: Row<TData>) => void; // Optional handler for update action
  onDelete?: (row: Row<TData>) => void; // Optional handler for delete action
  updateLink?: I18Link; // The update link
  deleteLink?: I18Link; // The delete link
  children?: React.ReactNode; // Additional extendible actions
};

function ActionCell<TData, TValue>({ cell, updateLink, deleteLink, onUpdate, onDelete, children }: ActionCellProps<TData, TValue>) {
  const t = useTranslations('table');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label={t('columns.actions')} variant="ghost" className="data-[state=open]:bg-muted flex size-8 p-0">
          <Ellipsis className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {/* Default Update Action */}
        {onUpdate && <DropdownMenuItem onSelect={() => onUpdate(cell.row)}>{t('columns.edit')}</DropdownMenuItem>}

        {/* Update Link */}
        {updateLink && (
          <DropdownMenuItem asChild>
            <Link href={updateLink}>{t('columns.edit')}</Link>
          </DropdownMenuItem>
        )}

        {/* Separator if both actions are present */}
        {onUpdate && onDelete && deleteLink && <DropdownMenuSeparator />}

        {/* Default Delete Action */}
        {onDelete && (
          <DropdownMenuItem onSelect={() => onDelete(cell.row)}>
            {t('columns.delete')}
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        )}

        {/* Delete Link */}
        {deleteLink && (
          <DropdownMenuItem>
            <Link href={deleteLink} className="text-danger">
              {t('columns.delete')}
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        )}

        {/* Custom Actions */}
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ActionCell };
