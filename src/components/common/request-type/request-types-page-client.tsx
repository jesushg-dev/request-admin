'use client';

import React, { memo, useMemo } from 'react';
import { useCountRequestCategory, useFindManyRequestCategory } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import { Prisma } from '@zenstackhq/runtime/models';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import { useTenantContext } from '@/components/hoc/tenant-provider';
import { Checkbox } from '@/components/ui/checkbox';
import { RequestCategoryTable, useRequestCategoryTableConfiguration } from '@/components/common/category/request-category-table';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import RequirementDialogCell from '@/components/common/requirement/requirement-dialog-cell';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

const RequestCategoryDefaultArgs = Prisma.validator<Prisma.RequestCategoryDefaultArgs>()({
  select: {
    id: true,
    name: true,
    tenantId: true,
    description: true,
    createdAt: true,
    _count: {
      select: {
        requestCategoryRequirements: true,
        subcategories: true,
        categoryForms: true,
      },
    },
  },
});

type CategoryWithRelations = Prisma.RequestCategoryGetPayload<typeof RequestCategoryDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<CategoryWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<CategoryWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
};

interface RequestTypesPageClientProps {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const RequestTypesPageClient: React.FC<RequestTypesPageClientProps> = ({ canCreate, canEdit, canDelete }) => {
  const { tenantId } = useTenantContext();
  const t = useTranslations('admin.requestType.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<CategoryWithRelations, Prisma.RequestCategoryFindManyArgs, Prisma.RequestCategoryCountArgs>({
    search,
    useCountHook: useCountRequestCategory,
    useFindManyHook: useFindManyRequestCategory,
    defaultArgs: {
      ...RequestCategoryDefaultArgs,
      where: {
        tenantId,
        hierarchyLevel: { is: { position: 1 } },
      },
    },
  });

  const { columns, filterFields, advancedFilterFields } = useMemo(() => getTableConfiguration({ t, tenantId, canEdit, canDelete }), [t, tenantId, canEdit, canDelete]);

  const { columns: categoryColumns } = useRequestCategoryTableConfiguration({
    entity: 'requestType',
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
    getRowCanExpand: (row) => row.original._count.subcategories > 0,
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
          render: ({ row, columns, isExpanded }) => <RequestCategoryTable referenceId={row.original.id} visibleCellsCount={row.getVisibleCells().length} columns={columns} isExpanded={isExpanded} />,
        }}>
        <DataTableAdvancedToolbar table={table} filterFields={advancedFilterFields} shallow={false}>
          <DataTableToolbarActions
            table={table}
            exportFilename="categories"
            entityLabel={t('entityLabel')}
            addLink={canCreate ? {
              pathname: '/admin/[tenantId]/configurations/request-types/new',
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
  const columns: ColumnDef<CategoryWithRelations>[] = [
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
      header: () => t('columns.description'),
      cell: ({ cell }) => cell.getValue() ?? '-',
    },
    {
      accessorKey: 'isEligibleForNewClients',
      header: () => t('columns.isEligibleForNewClients'),
      cell: ({ cell }) => <Checkbox checked={cell.getValue() as boolean} aria-label={(cell.getValue() as boolean) ? t('common.yes') : t('common.no')} disabled />,
    },
    {
      accessorKey: '_count.subcategories',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.categories')} />,
      cell: ({ cell }) => cell.getValue(),
      size: 30,
    },
    {
      accessorKey: '_count.categoryForms',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.forms')} />,
      cell: ({ cell }) => cell.getValue(),
      size: 30,
    },
    {
      accessorKey: '_count.requestCategoryRequirements',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.requirements')} />,
      cell: ({ cell }) => <RequirementDialogCell count={cell.getValue() as number} entity={t('entityLabel')} categoryId={cell.row.original.id} />,
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
        <ActionCell
          row={row}
          onDelete={canDelete ? () => console.log('Delete', row.original) : undefined}
          updateLink={canEdit ? {
            pathname: '/admin/[tenantId]/configurations/request-types/[slug]/edit',
            params: { tenantId, slug: row.original.id },
          } : undefined}
        />
      ),
      size: 20,
    },
  ];

  const filterFields: DataTableFilterField<CategoryWithRelations>[] = [{ id: 'name', label: t('filters.name'), placeholder: t('filters.namePlaceholder') }];

  const advancedFilterFields: DataTableAdvancedFilterField<CategoryWithRelations>[] = [
    { id: 'name', label: t('filters.name'), type: 'text' },
    { id: 'createdAt', label: t('filters.createdAt'), type: 'date' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(RequestTypesPageClient);

