'use client';

import React, { memo } from 'react';
import { useFindManyArea } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField, DataTableRowAction } from '@/types';
import { Area as AreaType } from '@zenstackhq/runtime/models';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import { UNSTABLE_TENANT_ID } from '@/lib/constant';
import { getValidFilters } from '@/lib/data-table';
import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { Shell } from '@/components/shell';

import { getColumns } from './_components/tasks-table-columns';
import { TasksTableFloatingBar } from './_components/tasks-table-floating-bar';
import { TasksTableToolbarActions } from './_components/tasks-table-toolbar-actions';

const searchParamsParsers = {
  // pagination
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<AreaType>().withDefault([{ id: 'createdAt', desc: true }]),
  // filter
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

  const { data, isLoading, error, refetch } = useFindManyArea({
    where: { tenantId: UNSTABLE_TENANT_ID },
    take: search.perPage,
    skip: (search.page - 1) * search.perPage,
  });

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

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount: 1,
    filterFields,
    enableAdvancedFilter: true,
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
      <DataTable table={table} floatingBar={<TasksTableFloatingBar table={table} />}>
        <DataTableAdvancedToolbar table={table} filterFields={advancedFilterFields} shallow={false}>
          <TasksTableToolbarActions table={table} />
        </DataTableAdvancedToolbar>
      </DataTable>
    </Shell>
  );
};

export default memo(AreaMainPage);
