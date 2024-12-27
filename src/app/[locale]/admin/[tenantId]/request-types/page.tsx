'use client';

import React, { memo, useMemo, useState } from 'react';
import { useCountCategory, useFindManyCategory } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField, DataTableRowAction } from '@/types';
import { Prisma } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import { Checkbox } from '@/components/ui/checkbox';
import CategoryTable from '@/components/common/category/category-table';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import RequirementDialogCell from '@/components/common/requirement/requirement-dialog-cell';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';
import { Shell } from '@/components/shell';

const CategoryDefaultArgs = Prisma.validator<Prisma.CategoryDefaultArgs>()({
  select: {
    id: true,
    name: true,
    createdAt: true,
    subcategories: {
      select: {
        id: true,
      },
    },
    _count: {
      select: {
        categoryRequirement: true,
      },
    },
  },
});

type CategoryWithRelations = Prisma.CategoryGetPayload<typeof CategoryDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<CategoryWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<CategoryWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
};

interface ICategoryMainPageProps {}

const CategoryMainPage: React.FC<ICategoryMainPageProps> = () => {
  const t = useTranslations('admin.requestType.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<CategoryWithRelations, Prisma.CategoryFindManyArgs, Prisma.CategoryCountArgs>({
    search,
    useCountHook: useCountCategory,
    useFindManyHook: useFindManyCategory,
    defaultArgs: {
      ...CategoryDefaultArgs,
      where: {
        hierarchy: { is: { type: 'Request' } },
        hierarchyLevel: { is: { position: 1 } },
      },
    },
  });

  const [rowAction, setRowAction] = useState<DataTableRowAction<CategoryWithRelations> | null>(null);
  const { columns, filterFields, advancedFilterFields } = useMemo(() => getTableConfiguration({ setRowAction, t }), [setRowAction, t]);

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
    getRowCanExpand: (row) => row.original.subcategories.length > 0,
    getRowId: (originalRow) => originalRow.id,
  });

  if (isError && error) return <ErrorRetryFallback error={error} onRetry={refetch} />;

  return (
    <Shell className="gap-2">
      <DataTableShell table={table} isLoading={isLoading} floatingBar={<DataTableFloatingBar table={table} />}>
        <DataTable table={table} renderSubComponent={CategoryTable}>
          <DataTableAdvancedToolbar table={table} filterFields={advancedFilterFields} shallow={false}>
            <DataTableToolbarActions table={table} exportFilename="categories" entityLabel={t('entityLabel')} />
          </DataTableAdvancedToolbar>
        </DataTable>
      </DataTableShell>
    </Shell>
  );
};

interface GetTableConfigurationProps {
  setRowAction: React.Dispatch<React.SetStateAction<DataTableRowAction<CategoryWithRelations> | null>>;
  t: ReturnType<typeof useTranslations>;
}

export function getTableConfiguration({ setRowAction, t }: GetTableConfigurationProps) {
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
      accessorKey: 'isEligibleForNewClients',
      header: () => t('columns.isEligibleForNewClients'),
      cell: ({ cell }) => <Checkbox checked={cell.getValue() as boolean} aria-label={(cell.getValue() as boolean) ? t('common.yes') : t('common.no')} disabled />,
    },
    {
      accessorKey: 'subcategories',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.categories')} />,
      cell: ({ cell }) => (cell.getValue() as { length: number }).length,
      size: 30,
    },
    {
      accessorKey: '_count.categoryRequirement',
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
      cell: (data) => <ActionCell cell={data} onDelete={() => console.log('Delete', data.row.original)} onUpdate={() => console.log('Update', data.row.original)} />,
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

export default memo(CategoryMainPage);
