'use client';

import React, { memo } from 'react';
import { useCountArea, useFindManyArea } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField, DataTableRowAction } from '@/types';
import { Area as AreaType } from '@zenstackhq/runtime/models';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import { UNSTABLE_TENANT_ID } from '@/lib/constant';
import { getValidFilters } from '@/lib/data-table';
import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';
import { Shell } from '@/components/shell';

import { getColumns } from './columns';

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<AreaType>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<AreaType>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
};

interface IAreaMainPageProps {}

const AreaMainPage: React.FC<IAreaMainPageProps> = ({}) => {
  const [search] = useQueryStates(searchParamsParsers);
  const validFilters = getValidFilters(search.filters);

  const { data, isLoading, error, refetch, pageCount } = useFetchTableData<AreaType, any, any>({
    search,
    validFilters,
    useCountHook: useCountArea,
    useFindManyHook: useFindManyArea,
    tenantId: UNSTABLE_TENANT_ID,
  });

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<AreaType> | null>(null);
  const columns = React.useMemo(() => getColumns({ setRowAction }), [setRowAction]);

  const filterFields: DataTableFilterField<AreaType>[] = [
    { id: 'name', label: 'Name', placeholder: 'Filter name' },
    { id: 'isActive', label: 'Active' },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<AreaType>[] = [
    { id: 'name', label: 'Name', type: 'text' },
    { id: 'isActive', label: 'Active', type: 'boolean' },
    { id: 'createdAt', label: 'Created at', type: 'date' },
  ];

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: true,
    initialState: {
      sorting: [{ id: 'name', desc: false }],
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
      <DataTable table={table} floatingBar={<DataTableFloatingBar table={table} />}>
        <DataTableAdvancedToolbar table={table} filterFields={advancedFilterFields} shallow={false}>
          <DataTableToolbarActions table={table} />
        </DataTableAdvancedToolbar>
      </DataTable>
    </Shell>
  );
};

export default memo(AreaMainPage);
