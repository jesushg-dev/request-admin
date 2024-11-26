'use client';

import React, { memo } from 'react';
import { z } from 'zod';

import { DateRangePicker } from '@/components/date-range-picker';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { Shell } from '@/components/shell';
import { Skeleton } from '@/components/ui/skeleton';
import { getValidFilters } from '@/lib/data-table';
import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { useFindManyArea } from '@/services/api/hooks';

import { Area as AreaType } from '@zenstackhq/runtime/models';
import { useQueryStates, parseAsArrayOf, parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs';
import { DataTableRowAction, DataTableFilterField, DataTableAdvancedFilterField } from '@/types';

import { FeatureFlagsProvider } from './_components/feature-flags-provider';
import { TasksTableFloatingBar } from './_components/tasks-table-floating-bar';
import { TasksTableToolbarActions } from './_components/tasks-table-toolbar-actions';
import { getColumns } from './_components/tasks-table-columns';

const searchParamsParsers = {
  flags: parseAsArrayOf(z.enum(['advancedTable', 'floatingBar'])).withDefault([]),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<AreaType>().withDefault([{ id: 'createdAt', desc: true }]),
  title: parseAsString.withDefault(''),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

interface IAreaMainPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const AreaMainPage: React.FC<IAreaMainPageProps> = ({ searchParams }) => {
  const [search] = useQueryStates(searchParamsParsers);
  const validFilters = getValidFilters(search.filters);

  const { data, isLoading, error, refetch } = useFindManyArea({});

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<AreaType> | null>(null);
  const columns = React.useMemo(() => getColumns({ setRowAction }), [setRowAction]);

  const filterFields: DataTableFilterField<AreaType>[] = [
    { id: 'name', label: 'Name', placeholder: 'Filter name' },
    { id: 'status', label: 'Status' },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<AreaType>[] = [
    { id: 'name', label: 'Name', type: 'text' },
    { id: 'status', label: 'Status', type: 'boolean' },
    { id: 'createdAt', label: 'Created at', type: 'date' },
  ];

  const enableAdvancedTable = search.flags.includes('advancedTable');
  const enableFloatingBar = search.flags.includes('floatingBar');

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount: 1,
    filterFields,
    enableAdvancedFilter: enableAdvancedTable,
    initialState: {
      sorting: [{ id: 'createdAt', desc: true }],
      columnPinning: { right: ['actions'] },
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    clearOnDefault: true,
  });

  if (isLoading) {
    return <DataTableSkeleton columnCount={6} searchableColumnCount={1} filterableColumnCount={2} cellWidths={['10rem', '40rem', '12rem', '12rem', '8rem', '8rem']} shrinkZero />;
  }

  return (
    <Shell className="gap-2">
      <FeatureFlagsProvider>
        <React.Suspense fallback={<Skeleton className="h-7 w-52" />}>
          <DateRangePicker triggerSize="sm" triggerClassName="ml-auto w-56 sm:w-60" align="end" shallow={false} />
        </React.Suspense>
        <DataTable table={table} floatingBar={enableFloatingBar ? <TasksTableFloatingBar table={table} /> : null}>
          {enableAdvancedTable ? (
            <DataTableAdvancedToolbar table={table} filterFields={advancedFilterFields} shallow={false}>
              <TasksTableToolbarActions table={table} />
            </DataTableAdvancedToolbar>
          ) : (
            <DataTableToolbar table={table} filterFields={filterFields}>
              <TasksTableToolbarActions table={table} />
            </DataTableToolbar>
          )}
        </DataTable>
      </FeatureFlagsProvider>
    </Shell>
  );
};

export default memo(AreaMainPage);
