'use client';

import React, { memo, useMemo } from 'react';
import { useCountArea, useFindManyArea } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import { Prisma } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import useTenantId from '@/hooks/use-tenant-id';
import { Checkbox } from '@/components/ui/checkbox';
import { AssignmentCategoryTable, useAssignmentCategoryTableConfiguration } from '@/components/common/category/assignment-category-table';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

const AreaDefaultArgs = Prisma.validator<Prisma.AreaDefaultArgs>()({
  select: {
    id: true,
    tenantId: true,
    name: true,
    isActive: true,
    createdAt: true,
    _count: { select: { userAreas: true, assignmentCategories: true } },
  },
});

type AreaWithRelations = Prisma.AreaGetPayload<typeof AreaDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<AreaWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<AreaWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
};

interface AreasPageClientProps {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const AreasPageClient: React.FC<AreasPageClientProps> = ({ canCreate, canEdit, canDelete }) => {
  const tenantId = useTenantId();
  const t = useTranslations('admin.area.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isError, error, refetch, isLoading, pageCount } = useFetchTableData<AreaWithRelations, Prisma.AreaFindManyArgs, Prisma.AreaCountArgs>({
    search,
    useCountHook: useCountArea,
    useFindManyHook: useFindManyArea,
    defaultArgs: {
      ...AreaDefaultArgs,
      where: { tenantId },
    },
  });

  const { columns, filterFields, advancedFilterFields } = useMemo(() => getTableConfiguration({ t, tenantId, canEdit, canDelete }), [t, tenantId, canEdit, canDelete]);

  // Grab the category columns from our new, fixed hook so we can pass them to the subComponent.
  const { columns: categoryColumns } = useAssignmentCategoryTableConfiguration({
    entity: 'area',
  });

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
    getRowCanExpand: (row) => row.original._count.assignmentCategories > 0,
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
          columns: categoryColumns,
          render: ({ row, isExpanded, columns }) => (
            <AssignmentCategoryTable
              parentType="area"
              isExpanded={isExpanded}
              columns={columns}
              areaId={row.original.id}
              referenceId={row.original.id}
              visibleCellsCount={row.getVisibleCells().length}
            />
          ),
        }}>
        <DataTableAdvancedToolbar table={table} filterFields={advancedFilterFields} shallow={false}>
          <DataTableToolbarActions
            table={table}
            exportFilename="areas"
            entityLabel={t('entityLabel')}
            addLink={canCreate ? {
              pathname: '/admin/[tenantId]/configurations/areas/new',
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
  const columns: ColumnDef<AreaWithRelations>[] = [
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
      accessorKey: 'isActive',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.isActive')} />,
      cell: ({ cell }) => <Checkbox checked={cell.getValue() as boolean} aria-label={t('columns.isActive')} disabled />,
      size: 20,
    },
    {
      accessorKey: '_count.assignmentCategories',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.categories')} />,
      cell: ({ cell }) => cell.getValue(),
      size: 30,
    },
    {
      accessorKey: '_count.userAreas',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.users')} />,
      cell: ({ cell }) => cell.getValue(),
      size: 30,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
      cell: ({ cell }) => formatDate(cell.getValue() as Date),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ActionCell
          row={row}
          onDelete={canDelete ? () => console.log('Delete', row.original) : undefined}
          updateLink={canEdit ? {
            pathname: '/admin/[tenantId]/configurations/areas/[slug]/edit',
            params: { tenantId: row.original.tenantId, slug: row.original.id },
          } : undefined}
        />
      ),
      size: 20,
    },
  ];

  const filterFields: DataTableFilterField<AreaWithRelations>[] = [
    { id: 'name', label: t('filters.name'), placeholder: t('filters.namePlaceholder') },
    { id: 'isActive', label: t('filters.isActive') },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<AreaWithRelations>[] = [
    { id: 'name', label: t('filters.name'), type: 'text' },
    { id: 'isActive', label: t('filters.isActive'), type: 'boolean' },
    { id: 'createdAt', label: t('filters.createdAt'), type: 'date' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(AreasPageClient);

