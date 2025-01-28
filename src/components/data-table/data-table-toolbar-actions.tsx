'use client';

import { ComponentProps } from 'react';
import { Link } from '@/i18n/routing';
import { type Table } from '@tanstack/react-table';
import { Download, FileTextIcon, Plus, SheetIcon, TablePropertiesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { exportTableToCSV, exportTableToExcel, exportTableToPDF } from '@/lib/export';
import { Button } from '@/components/ui/button';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { DataTableDeleteDialog } from './data-table-delete-dialog';

interface DataTableToolbarActionsProps<T> {
  table: Table<T>;
  exportFilename?: string;
  entityLabel: string;
  children?: React.ReactNode;
  addLink?: ComponentProps<typeof Link>['href'];
}

export function DataTableToolbarActions<T>({ table, entityLabel, exportFilename, children, addLink }: DataTableToolbarActionsProps<T>) {
  const t = useTranslations('table');

  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DataTableDeleteDialog entityLabel={entityLabel} items={table.getFilteredSelectedRowModel().rows.map((row) => row.original)} onDelete={async () => table.toggleAllRowsSelected(false)} />
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="size-4" aria-hidden="true" />
            {t('actions.export')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              exportTableToCSV(table, {
                filename: exportFilename,
                excludeColumns: ['select', 'actions'],
              });
            }}>
            <TablePropertiesIcon className="size-4 mr-1" aria-hidden="true" />
            CSV
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              exportTableToExcel(table, {
                filename: exportFilename,
                excludeColumns: ['select', 'actions'],
              });
            }}>
            <SheetIcon className="size-4 mr-1" aria-hidden="true" />
            Excel
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              exportTableToPDF(table, {
                filename: exportFilename,
                excludeColumns: ['select', 'actions'],
              });
            }}>
            <FileTextIcon className="size-4 mr-1" aria-hidden="true" />
            PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {addLink && (
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href={addLink}>
            <Plus className="size-4" aria-hidden="true" />
            {t('columns.new')}
          </Link>
        </Button>
      )}
      {/* Additional actions can be added dynamically */}
      {children}
    </div>
  );
}
