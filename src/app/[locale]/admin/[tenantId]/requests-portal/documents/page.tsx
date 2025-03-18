'use client';

import React, { memo, useMemo } from 'react';
import { useCountDocument, useFindManyDocument } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import { Prisma } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import useTenantId from '@/hooks/use-tenant-id';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

const DocumentDefaultArgs = Prisma.validator<Prisma.DocumentDefaultArgs>()({
  select: {
    id: true,
    name: true,
    createdAt: true,
    status: true,
    request: {
      select: {
        id: true,
      },
    },
  },
});

type DocumentWithRelations = Prisma.DocumentGetPayload<typeof DocumentDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<DocumentWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<DocumentWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
};

const DocumentMainPage: React.FC = () => {
  const tenantId = useTenantId();
  const t = useTranslations('admin.document.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<DocumentWithRelations, Prisma.DocumentFindManyArgs, Prisma.DocumentCountArgs>({
    search,
    useCountHook: useCountDocument,
    useFindManyHook: useFindManyDocument,
    defaultArgs: {
      ...DocumentDefaultArgs,
      where: { request: { tenantId } },
    },
  });

  const { columns, filterFields, advancedFilterFields } = useMemo(() => getTableConfiguration({ t }), [t]);

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
    getRowCanExpand: () => false,
    getRowId: (originalRow) => originalRow.id,
  });

  if (isError && error) {
    return <ErrorRetryFallback error={error} onRetry={refetch} />;
  }

  return (
    <DataTableShell table={table} floatingBar={<DataTableFloatingBar table={table} />}>
      <DataTable table={table} isLoading={isLoading}>
        <DataTableAdvancedToolbar table={table} filterFields={advancedFilterFields} shallow={false}>
          <DataTableToolbarActions
            table={table}
            exportFilename="documents"
            entityLabel={t('entityLabel')}
            addLink={{
              pathname: '/admin/[tenantId]/requests-portal/documents/new',
              params: { tenantId },
            }}
          />
        </DataTableAdvancedToolbar>
      </DataTable>
    </DataTableShell>
  );
};

interface GetTableConfigurationProps {
  t: ReturnType<typeof useTranslations>;
}

function getTableConfiguration({ t }: GetTableConfigurationProps) {
  const columns: ColumnDef<DocumentWithRelations>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'request.priority',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.priority')} />,
      cell: ({ cell }) => cell.getValue(),
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

  const filterFields: DataTableFilterField<DocumentWithRelations>[] = [
    { id: 'name', label: t('filters.name'), placeholder: t('filters.namePlaceholder') },
    { id: 'status', label: t('filters.status'), placeholder: t('filters.statusPlaceholder') },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<DocumentWithRelations>[] = [
    { id: 'name', label: t('filters.name'), type: 'text' },
    { id: 'status', label: t('filters.status'), type: 'text' },
    { id: 'createdAt', label: t('filters.createdAt'), type: 'date' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(DocumentMainPage);
