'use client';

import React, { memo, useMemo, useState } from 'react';
import { useCountHierarchy, useFindManyHierarchy } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField, DataTableRowAction } from '@/types';
import { Prisma } from '@prisma/client';
import { Checkbox } from '@radix-ui/react-checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { LevelTable, useLevelTableColumns } from '@/components/common/hierarchy/level-table';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

const HierarchyDefaultArgs = Prisma.validator<Prisma.HierarchyDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    type: true,
    createdAt: true,
    levels: { select: { id: true, name: true, position: true }, orderBy: { position: 'asc' } },
    _count: { select: { categories: true, levels: true } },
  },
});

type HierarchyWithRelations = Prisma.HierarchyGetPayload<typeof HierarchyDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<HierarchyWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<HierarchyWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
};

interface IHierarchyMainPageProps {}

const HierarchyMainPage: React.FC<IHierarchyMainPageProps> = () => {
  const t = useTranslations('admin.hierarchy.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<HierarchyWithRelations, Prisma.HierarchyFindManyArgs, Prisma.HierarchyCountArgs>({
    search,
    useCountHook: useCountHierarchy,
    useFindManyHook: useFindManyHierarchy,
    defaultArgs: HierarchyDefaultArgs,
  });

  const [rowAction, setRowAction] = useState<DataTableRowAction<HierarchyWithRelations> | null>(null);
  const { columns, filterFields, advancedFilterFields } = useMemo(() => getTableConfiguration({ setRowAction, t }), [setRowAction, t]);
  const { columns: levelColumns } = useLevelTableColumns();

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
    shallow: false,
    clearOnDefault: true,
    getRowCanExpand: (row) => (row.original.levels?.length ?? 0) > 0,
    getRowId: (originalRow) => originalRow.id,
  });

  if (isError && error) {
    return <ErrorRetryFallback error={error} onRetry={refetch} />;
  }

  return (
    <DataTableShell table={table} isLoading={isLoading} floatingBar={<DataTableFloatingBar table={table} />}>
      <DataTable table={table} subComponent={{ columns: levelColumns, render: LevelTable }}>
        <DataTableAdvancedToolbar table={table} filterFields={advancedFilterFields} shallow={false}>
          <DataTableToolbarActions table={table} exportFilename="hierarchies" entityLabel={t('entityLabel')} />
        </DataTableAdvancedToolbar>
      </DataTable>
    </DataTableShell>
  );
};

interface GetTableConfigurationProps {
  setRowAction: React.Dispatch<React.SetStateAction<DataTableRowAction<HierarchyWithRelations> | null>>;
  t: ReturnType<typeof useTranslations>;
}

export function getTableConfiguration({ setRowAction, t }: GetTableConfigurationProps) {
  const columns: ColumnDef<HierarchyWithRelations>[] = [
    {
      id: 'name',
      header: ({ table }) => (
        <div className="flex items-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
            className="mr-2"
          />
          <span>{t('columns.name')}</span>
        </div>
      ),
      cell: ({ row }) => {
        const hasSubRows = row.getCanExpand();

        return (
          <div
            style={{
              paddingLeft: `${row.depth * 1.5}rem`,
            }}
            className="flex items-center">
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label={t('columns.selectRow')} className="mr-2" />
            {hasSubRows && (
              <button onClick={row.getToggleExpandedHandler()} style={{ cursor: 'pointer' }} className="mr-2">
                {row.getIsExpanded() ? <ChevronUp className="size-4 shrink-0 opacity-50" /> : <ChevronDown className="size-4 shrink-0 opacity-50" />}
              </button>
            )}
            <span>{row.original.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.description')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'levels',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.levels')} />,
      cell: ({ cell }) => (cell.getValue() as { length: number }).length,
    },
    {
      accessorKey: '_count.categories',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.categories')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: '_count.levels',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.levelsCount')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      id: 'actions',
      cell: (data) => <ActionCell cell={data} onDelete={() => console.log('Delete', data.row.original)} onUpdate={() => console.log('Update', data.row.original)} />,
      size: 20,
    },
  ];

  const filterFields: DataTableFilterField<HierarchyWithRelations>[] = [
    { id: 'name', label: t('filters.name'), placeholder: t('filters.namePlaceholder') },
    { id: 'type', label: t('filters.type') },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<HierarchyWithRelations>[] = [
    { id: 'name', label: t('filters.name'), type: 'text' },
    { id: 'type', label: t('filters.type'), type: 'text' },
    { id: 'description', label: t('filters.description'), type: 'text' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(HierarchyMainPage);
