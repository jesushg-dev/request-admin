'use client';

import React, { memo, useMemo } from 'react';
import { useCountRequestHierarchy, useFindManyRequestHierarchy } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import { Prisma } from '@zenstackhq/runtime/models';
import { Checkbox } from '@radix-ui/react-checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import useTenantId from '@/hooks/use-tenant-id';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { RequestHierarchyLevelTable, useRequestLevelTableColumns } from '@/components/common/hierarchy/request-hierarchy-level-table';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

const HierarchyDefaultArgs = Prisma.validator<Prisma.RequestHierarchyDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    tenantId: true,
    createdAt: true,
    levels: { select: { id: true, name: true, position: true }, orderBy: { position: 'asc' } },
    _count: { select: { categories: true, levels: true } },
  },
});

type RequestHierarchyWithRelations = Prisma.RequestHierarchyGetPayload<typeof HierarchyDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<RequestHierarchyWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<RequestHierarchyWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
};

interface RequestHierarchiesPageClientProps {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const RequestHierarchiesPageClient: React.FC<RequestHierarchiesPageClientProps> = ({ canCreate, canEdit, canDelete }) => {
  const tenantId = useTenantId();
  const t = useTranslations('admin.hierarchy.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<RequestHierarchyWithRelations, Prisma.RequestHierarchyFindManyArgs, Prisma.RequestHierarchyCountArgs>({
    search,
    useCountHook: useCountRequestHierarchy,
    useFindManyHook: useFindManyRequestHierarchy,
    defaultArgs: HierarchyDefaultArgs,
  });

  const { columns, filterFields, advancedFilterFields } = useMemo(() => getTableConfiguration({ t, tenantId, canEdit, canDelete }), [t, tenantId, canEdit, canDelete]);
  const { columns: levelColumns } = useRequestLevelTableColumns();

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
    <DataTableShell table={table} floatingBar={<DataTableFloatingBar table={table} />}>
      <DataTable
        table={table}
        isLoading={isLoading}
        subComponent={{
          columns: levelColumns,
          render: ({ row, columns, isExpanded }) => <RequestHierarchyLevelTable levels={row.original.levels} columns={columns} isExpanded={isExpanded} />,
        }}>
        <DataTableAdvancedToolbar table={table} filterFields={advancedFilterFields} shallow={false}>
          <DataTableToolbarActions
            table={table}
            exportFilename="hierarchies"
            entityLabel={t('entityLabel')}
            addLink={canCreate ? {
              pathname: '/admin/[tenantId]/configurations/request-hierarchies/new',
              params: { tenantId },
            } : undefined}
          />
        </DataTableAdvancedToolbar>
      </DataTable>
    </DataTableShell>
  );
};

interface GetTableConfigurationProps {
  t: ReturnType<typeof useTranslations>;
  tenantId: string;
  canEdit: boolean;
  canDelete: boolean;
}

function getTableConfiguration({ t, tenantId, canEdit, canDelete }: GetTableConfigurationProps) {
  const columns: ColumnDef<RequestHierarchyWithRelations>[] = [
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
      cell: ({ row }) => (
        <ActionCell
          row={row}
          onDelete={canDelete ? () => console.log('Delete', row.original) : undefined}
          updateLink={canEdit ? {
            pathname: '/admin/[tenantId]/configurations/request-hierarchies/[slug]/edit',
            params: { tenantId, slug: row.original.id },
          } : undefined}
        />
      ),
      size: 20,
    },
  ];

  const filterFields: DataTableFilterField<RequestHierarchyWithRelations>[] = [{ id: 'name', label: t('filters.name'), placeholder: t('filters.namePlaceholder') }];

  const advancedFilterFields: DataTableAdvancedFilterField<RequestHierarchyWithRelations>[] = [
    { id: 'name', label: t('filters.name'), type: 'text' },
    { id: 'description', label: t('filters.description'), type: 'text' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(RequestHierarchiesPageClient);

