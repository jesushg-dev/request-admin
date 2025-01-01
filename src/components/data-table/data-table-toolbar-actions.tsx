'use client';

import { ComponentProps } from 'react';
import { Link } from '@/i18n/routing';
import { type Table } from '@tanstack/react-table';
import { Download, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { exportTableToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';

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
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          exportTableToCSV(table, {
            filename: exportFilename,
            excludeColumns: ['select', 'actions'],
          });
        }}
        className="gap-2">
        <Download className="size-4" aria-hidden="true" />
        {t('actions.export')}
      </Button>

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
