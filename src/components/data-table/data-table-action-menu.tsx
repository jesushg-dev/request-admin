import React from 'react';
import { CellContext, Row } from '@tanstack/react-table';
import { Ellipsis } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { Button } from '../ui/button';

type ActionCellProps<TData = any, TValue = any> = {
  cell: CellContext<TData, TValue>; // The cell context
  onUpdate?: (row: Row<TData>) => void; // Optional handler for update action
  onDelete?: (row: Row<TData>) => void; // Optional handler for delete action
  children?: React.ReactNode; // Additional extendible actions
};

export const ActionCell: React.FC<ActionCellProps> = ({ cell, onUpdate, onDelete, children }) => {
  const t = useTranslations('table');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label={t('columns.actions')} variant="ghost" className="flex size-8 p-0 data-[state=open]:bg-muted">
          <Ellipsis className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {/* Default Update Action */}
        {onUpdate && <DropdownMenuItem onSelect={() => onUpdate(cell.row)}>{t('columns.edit')}</DropdownMenuItem>}

        {/* Separator if both actions are present */}
        {onUpdate && onDelete && <DropdownMenuSeparator />}

        {/* Default Delete Action */}
        {onDelete && (
          <DropdownMenuItem onSelect={() => onDelete(cell.row)}>
            {t('columns.delete')}
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        )}

        {/* Custom Actions */}
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
