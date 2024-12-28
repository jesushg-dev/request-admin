'use client';

import React, { memo, useMemo, useState } from 'react';
import { useCountClient, useFindManyClient } from '@/services/api/hooks';
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
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';
import { Shell } from '@/components/shell';

const ClientDefaultArgs = Prisma.validator<Prisma.ClientDefaultArgs>()({
  select: {
    id: true,
    createdAt: true,
    corporateName: true,
    monthlyIncome: true,
    occupation: true,
    person: { select: { firstName: true, lastName: true, email: true, phone: true } },
  },
});

type ClientWithRelations = Prisma.ClientGetPayload<typeof ClientDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<ClientWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<ClientWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

interface IClientMainPageProps {}

const ClientMainPage: React.FC<IClientMainPageProps> = () => {
  const t = useTranslations('admin.client.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<ClientWithRelations, Prisma.ClientFindManyArgs, Prisma.ClientCountArgs>({
    search,
    useCountHook: useCountClient,
    useFindManyHook: useFindManyClient,
    defaultArgs: {
      ...ClientDefaultArgs,
    },
  });

  const [rowAction, setRowAction] = useState<DataTableRowAction<ClientWithRelations> | null>(null);
  const { columns, filterFields, advancedFilterFields } = useMemo(() => getTableConfiguration({ setRowAction, t }), [setRowAction, t]);

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: true,
    initialState: {
      sorting: [{ id: 'person', desc: false }],
      columnPinning: { right: ['actions'] },
    },
    shallow: false,
    clearOnDefault: true,
    getRowCanExpand: () => false,
    getRowId: (originalRow) => originalRow.id,
  });

  if (isError && error) return <ErrorRetryFallback error={error} onRetry={refetch} />;

  return (
    <Shell className="gap-2">
      <DataTableShell table={table} isLoading={isLoading} floatingBar={<DataTableFloatingBar table={table} />}>
        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table} filterFields={advancedFilterFields} shallow={false}>
            <DataTableToolbarActions table={table} exportFilename="clients" entityLabel={t('entityLabel')} />
          </DataTableAdvancedToolbar>
        </DataTable>
      </DataTableShell>
    </Shell>
  );
};

interface GetTableConfigurationProps {
  setRowAction: React.Dispatch<React.SetStateAction<DataTableRowAction<ClientWithRelations> | null>>;
  t: ReturnType<typeof useTranslations>;
}

export function getTableConfiguration({ setRowAction, t }: GetTableConfigurationProps) {
  const columns: ColumnDef<ClientWithRelations>[] = [
    {
      accessorKey: 'person.firstName',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.firstName')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'person.lastName',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.lastName')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'person.email',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.email')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'person.phone',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.phone')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'corporateName',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.corporateName')} />,
      cell: ({ cell }) => cell.getValue() ?? 'N/A',
    },
    {
      accessorKey: 'monthlyIncome',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.monthlyIncome')} />,
      cell: ({ cell }) => `$${(cell.getValue() as number).toLocaleString()}`,
    },
    {
      accessorKey: 'occupation',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.occupation')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
      cell: ({ cell }) => formatDate(cell.getValue() as Date),
    },
    {
      id: 'actions',
      cell: (data) => <ActionCell cell={data} onDelete={console.log} onUpdate={console.log} />,
      size: 20,
    },
  ];

  const filterFields: DataTableFilterField<ClientWithRelations>[] = [{ id: 'person', label: t('filters.name'), placeholder: t('filters.namePlaceholder') }];

  const advancedFilterFields: DataTableAdvancedFilterField<ClientWithRelations>[] = [
    { id: 'person', label: t('filters.name'), type: 'text' },
    { id: 'createdAt', label: t('filters.createdAt'), type: 'date' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(ClientMainPage);
