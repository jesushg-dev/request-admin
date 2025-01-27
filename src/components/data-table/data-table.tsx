import { createContext, Fragment, ReactNode, useContext } from 'react';
import { ColumnDef, flexRender, type Row, type Table as TanstackTable } from '@tanstack/react-table';
import { NotepadText, NotepadTextDashed } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { parseAsBoolean, useQueryState } from 'nuqs';

import { getCommonPinningStyles } from '@/lib/data-table';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';

import { Hint } from '../hint';
import { Button } from '../ui/button';
import { DataTableSkeleton } from './data-table-skeleton';

interface DataTableContextValue {
  isStatsOpen: boolean;
  toggleStats: () => void;
}

interface CommonDataTableProps<TData> {
  table: TanstackTable<TData>;
}

interface DataTableShellProps<TData> extends CommonDataTableProps<TData>, React.HTMLAttributes<HTMLDivElement> {
  floatingBar?: React.ReactNode | null;
  children?: React.ReactNode;
}

const DataTableStatsContext = createContext<DataTableContextValue | undefined>(undefined);

export function DataTableShell<TData>({ table, floatingBar = null, children, className, ...props }: DataTableShellProps<TData>) {
  const [isStatsOpen, setIsStatsOpen] = useQueryState<boolean>('stats', parseAsBoolean.withDefault(false));

  const toggleStats = () => setIsStatsOpen((prev) => !prev);

  return (
    <div className={cn('flex w-full flex-col gap-1 overflow-auto p-2 flex-1', className)} {...props}>
      <DataTableStatsContext.Provider value={{ isStatsOpen, toggleStats }}>{children}</DataTableStatsContext.Provider>
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
  isLoading?: boolean;
}

export function DataTable<TData, TSubData>({ table, subComponent, isLoading, children }: DataTableProps<TData, TSubData>) {
  if (isLoading) {
    return <DataTableSkeleton columnCount={10} cellWidths={['10rem', '40rem', '12rem', '12rem', '8rem', '8rem']} shrinkZero />;
  }

  return (
    <>
      {children}
      <div className="flex flex-1 overflow-auto rounded-md border">
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
                <Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() ? 'selected' : undefined}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} style={{ ...getCommonPinningStyles({ column: cell.column }) }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>

                  {subComponent?.render && subComponent.render({ row, isExpanded: row.getIsExpanded(), columns: subComponent.columns })}
                </Fragment>
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

export function useDataTable() {
  const context = useContext(DataTableStatsContext);
  if (!context) {
    throw new Error('useDataTableStats must be used within a DataTableStatsProvider');
  }
  return context;
}

export function DataTableStatsToggle() {
  const { isStatsOpen, toggleStats } = useDataTable();

  return (
    <Hint label={isStatsOpen ? 'Hide Stats' : 'Show Stats'}>
      <Button onClick={toggleStats} variant="outline" type="button" size="sm">
        {isStatsOpen ? <NotepadTextDashed className="h-4 w-4" /> : <NotepadText className="h-4 w-4" />}
      </Button>
    </Hint>
  );
}

export function DataTableStatsWrapper({ children }: { children: ReactNode }) {
  const { isStatsOpen } = useDataTable();

  return (
    <AnimatePresence>
      {isStatsOpen && (
        <motion.div
          className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
