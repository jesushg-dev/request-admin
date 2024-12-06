'use client';

import { type Table } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { exportTableToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { DataTableDeleteDialog } from './data-table-delete-dialog';

interface DataTableToolbarActionsProps<T> {
  table: Table<T>;
  filename?: string;
  entityLabel: string;
  children?: React.ReactNode;
}

export function DataTableToolbarActions<T>({ table, entityLabel, filename, children }: DataTableToolbarActionsProps<T>) {
  const t = useTranslations('table');

  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DataTableDeleteDialog entityLabel={entityLabel} items={table.getFilteredSelectedRowModel().rows.map((row) => row.original)} onDelete={async () => table.toggleAllRowsSelected(false)} />
      ) : null}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          exportTableToCSV(table, {
            filename: filename,
            excludeColumns: ['select', 'actions'],
          });
        }}
        className="gap-2">
        <Download className="size-4" aria-hidden="true" />
        {t('actions.export')}
      </Button>

      {/* Additional actions can be added dynamically */}
      {children}
    </div>
  );
}
