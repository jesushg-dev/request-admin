import React from 'react';
import { I18Link, Link } from '@/i18n/routing';
import { Row } from '@tanstack/react-table';
import { Ellipsis, EyeIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { Button } from '../ui/button';

type ActionCellProps<TData> = {
  row: Row<TData>; // The cell context
  onUpdate?: (row: Row<TData>) => void; // Optional handler for update action
  onDelete?: (row: Row<TData>) => void; // Optional handler for delete action
  viewLink?: I18Link; // The view link
  updateLink?: I18Link; // The update link
  deleteLink?: I18Link; // The delete link
  children?: React.ReactNode; // Additional extendible actions
};

function ActionCell<TData>({ row, viewLink, updateLink, deleteLink, onUpdate, onDelete, children }: ActionCellProps<TData>) {
  const t = useTranslations('table');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label={t('columns.actions')} variant="ghost" className="data-[state=open]:bg-muted flex size-8 p-0">
          <Ellipsis className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {/* Default View Action */}
        {viewLink && (
          <DropdownMenuItem asChild>
            <Link href={viewLink} className="flex gap-2">
              <EyeIcon className="size-4" aria-hidden="true" /> {t('columns.view')}
            </Link>
          </DropdownMenuItem>
        )}

        {/* Default Update Action */}
        {onUpdate && (
          <DropdownMenuItem onSelect={() => onUpdate(row)}>
            <PencilIcon className="size-4" aria-hidden="true" />
            {t('columns.edit')}
          </DropdownMenuItem>
        )}

        {/* Update Link */}
        {updateLink && (
          <DropdownMenuItem asChild>
            <Link href={updateLink} className="flex gap-2">
              <PencilIcon className="size-4" aria-hidden="true" />
              {t('columns.edit')}
            </Link>
          </DropdownMenuItem>
        )}

        {/* Separator if both actions are present */}
        {onUpdate && onDelete && deleteLink && <DropdownMenuSeparator />}

        {/* Default Delete Action */}
        {onDelete && (
          <DropdownMenuItem onSelect={() => onDelete(row)}>
            <Trash2Icon className="size-4 text-danger" aria-hidden="true" />
            {t('columns.delete')}
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        )}

        {/* Delete Link */}
        {deleteLink && (
          <DropdownMenuItem>
            <Link href={deleteLink} className="text-danger">
              <Trash2Icon className="size-4 text-danger" aria-hidden="true" />
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
