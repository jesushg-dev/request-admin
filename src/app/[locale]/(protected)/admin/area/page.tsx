'use client';

import React, { memo } from 'react';
import { useCountArea, useFindManyArea } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField, DataTableRowAction } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Area as AreaType } from '@zenstackhq/runtime/models';
import { Ellipsis } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import { UNSTABLE_TENANT_ID } from '@/lib/constant';
import { getValidFilters } from '@/lib/data-table';
import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';
import { Shell } from '@/components/shell';

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

const AreaMainPage: React.FC<IAreaMainPageProps> = () => {
  const t = useTranslations('admin.area.main');
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
  const columns = React.useMemo(() => getColumns({ setRowAction, t }), [setRowAction, t]);

  const filterFields: DataTableFilterField<AreaType>[] = [
    { id: 'name', label: t('filters.name'), placeholder: t('filters.namePlaceholder') },
    { id: 'isActive', label: t('filters.isActive') },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<AreaType>[] = [
    { id: 'name', label: t('filters.name'), type: 'text' },
    { id: 'isActive', label: t('filters.isActive'), type: 'boolean' },
    { id: 'createdAt', label: t('filters.createdAt'), type: 'date' },
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

  return (
    <Shell className="gap-2">
      <DataTable isLoading={isLoading} table={table} floatingBar={<DataTableFloatingBar table={table} />}>
        <DataTableAdvancedToolbar table={table} filterFields={advancedFilterFields} shallow={false}>
          <DataTableToolbarActions table={table} filename="areas" entityLabel={t('entityLabel')} />
        </DataTableAdvancedToolbar>
      </DataTable>
    </Shell>
  );
};

interface GetColumnsProps {
  setRowAction: React.Dispatch<React.SetStateAction<DataTableRowAction<AreaType> | null>>;
  t: ReturnType<typeof useTranslations>;
}

export function getColumns({ setRowAction, t }: GetColumnsProps): ColumnDef<AreaType>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t('columns.select')}
          className="ml-2 translate-y-0.5"
        />
      ),
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label={t('columns.selectRow')} className="ml-2 translate-y-0.5" />,
      enableSorting: false,
      enableHiding: false,
      size: 20,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.isActive')} />,
      cell: ({ cell }) => <Checkbox checked={cell.getValue() as boolean} aria-label={t('columns.isActive')} />,
      size: 20,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
      cell: ({ cell }) => formatDate(cell.getValue() as Date),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label={t('columns.actions')} variant="ghost" className="flex size-8 p-0 data-[state=open]:bg-muted">
              <Ellipsis className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onSelect={() => setRowAction({ row, type: 'update' })}>{t('actions.edit')}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setRowAction({ row, type: 'delete' })}>
              {t('actions.delete')}
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 20,
    },
  ] satisfies ColumnDef<AreaType>[];
}

export default memo(AreaMainPage);
