'use client';

import React, { memo, useMemo } from 'react';
import { useCountPlan, useFindManyPlan } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Prisma } from '@zenstackhq/runtime/models';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

const PlanDefaultArgs = Prisma.validator<Prisma.PlanDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    price: true,
    durationInDays: true,
    createdAt: true,
    updatedAt: true,
    _count: {
      select: {
        features: true,
        subscriptions: true,
      },
    },
  },
});

type PlanWithRelations = Prisma.PlanGetPayload<typeof PlanDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<PlanWithRelations>().withDefault([]),
  filters: getFiltersStateParser<PlanWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

const PlansMainPage: React.FC = () => {
  const t = useTranslations('admin.plans.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<PlanWithRelations, Prisma.PlanFindManyArgs, Prisma.PlanCountArgs>({
    search,
    useCountHook: useCountPlan,
    useFindManyHook: useFindManyPlan,
    defaultArgs: PlanDefaultArgs,
  });

  const { columns, filterFields, advancedFilterFields } = useMemo(() => getTableConfiguration({ t }), [t]);

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: true,
    initialState: {
      sorting: [],
      columnPinning: { right: ['actions'] },
    },
    shallow: false,
    clearOnDefault: true,
    getRowId: (originalRow) => originalRow.id,
  });

  if (isError && error) {
    return <ErrorRetryFallback error={error} onRetry={refetch} />;
  }

  return (
    <DataTableShell table={table} floatingBar={<DataTableFloatingBar table={table} />}>
      <DataTable table={table} isLoading={isLoading}>
        <DataTableAdvancedToolbar table={table} filterFields={advancedFilterFields} shallow={false}>
          <DataTableToolbarActions table={table} exportFilename="plans" entityLabel={t('entityLabel')} />
        </DataTableAdvancedToolbar>
      </DataTable>
    </DataTableShell>
  );
};

interface GetTableConfigurationProps {
  t: ReturnType<typeof useTranslations>;
}

function getTableConfiguration({ t }: GetTableConfigurationProps) {
  const columns: ColumnDef<PlanWithRelations>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.description')} />,
      cell: ({ cell }) => {
        const description = cell.getValue() as string;
        return description?.length > 50 ? `${description.substring(0, 50)}...` : description;
      },
    },
    {
      accessorKey: 'price',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.price')} />,
      cell: ({ cell }) => {
        const price = cell.getValue() as number;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(price);
      },
    },
    {
      accessorKey: 'durationInDays',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.duration')} />,
      cell: ({ cell }) => {
        const days = cell.getValue() as number | null;
        return days ? `${days} ${t('days') || 'days'}` : t('unlimited') || 'Unlimited';
      },
    },
    {
      accessorKey: '_count.features',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.features')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: '_count.subscriptions',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.subscriptions')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      id: 'actions',
      cell: ({ row }) => <ActionCell row={row} onDelete={() => console.log('Delete', row.original)} onUpdate={() => console.log('Update', row.original)} />,
      size: 20,
    },
  ];

  const filterFields: DataTableFilterField<PlanWithRelations>[] = [
    { id: 'name', label: t('filters.name'), placeholder: t('filters.namePlaceholder') },
    { id: 'description', label: t('filters.description'), placeholder: t('filters.descriptionPlaceholder') },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<PlanWithRelations>[] = [
    { id: 'name', label: t('filters.name'), type: 'text' },
    { id: 'description', label: t('filters.description'), type: 'text' },
    { id: 'price', label: t('filters.price'), type: 'number' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(PlansMainPage);
