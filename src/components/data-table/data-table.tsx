import * as React from 'react';
import { ColumnDef, flexRender, type Row, type Table as TanstackTable } from '@tanstack/react-table';

import { getCommonPinningStyles } from '@/lib/data-table';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';

import { DataTableSkeleton } from './data-table-skeleton';

interface CommonDataTableProps<TData> {
  table: TanstackTable<TData>;
  isLoading?: boolean;
}

interface DataTableShellProps<TData> extends CommonDataTableProps<TData>, React.HTMLAttributes<HTMLDivElement> {
  floatingBar?: React.ReactNode | null;
  children?: React.ReactNode;
}

export function DataTableShell<TData>({ table, floatingBar = null, isLoading, children, className, ...props }: DataTableShellProps<TData>) {
  return (
    <div className={cn('w-full space-y-2.5 overflow-auto', className)} {...props}>
      {children}

      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
      </div>
    </div>
  );
}

interface DataTableProps<TData, TSubData> extends CommonDataTableProps<TData> {
  children?: React.ReactNode;
  subComponent?: {
    columns: ColumnDef<TSubData>[];
    render: (props: { row: Row<TData>; isExpanded: boolean; columns: ColumnDef<TSubData>[] }) => React.ReactNode;
  };
}

export function DataTable<TData, TSubData>({ table, subComponent, isLoading, children }: DataTableProps<TData, TSubData>) {
  if (isLoading) {
    return <DataTableSkeleton columnCount={6} cellWidths={['10rem', '40rem', '12rem', '12rem', '8rem', '8rem']} shrinkZero />;
  }

  return (
    <>
      {children}
      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan} style={{ ...getCommonPinningStyles({ column: header.column }) }}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() ? 'selected' : undefined}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} style={{ ...getCommonPinningStyles({ column: cell.column }) }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>

                  {subComponent?.render && subComponent.render({ row, isExpanded: row.getIsExpanded(), columns: subComponent.columns })}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
