'use client';

import React, { memo, useMemo } from 'react';
import { useCountRequest, useFindManyRequest } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import { Prisma } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
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

const RequestDefaultArgs = Prisma.validator<Prisma.RequestDefaultArgs>()({
  select: {
    id: true,
    issueSubject: true,
    description: true,
    requestAssignments: {
      select: {
        requestCategory: {
          select: {
            name: true,
          },
        },
        assignmentCategory: {
          select: {
            name: true,
          },
        },
      },
    },
    _count: {
      select: {
        documents: true,
        requestAssignments: true,
        complianceTrackings: true,
      },
    },
  },
});

type RequestWithRelations = Prisma.RequestGetPayload<typeof RequestDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<RequestWithRelations>().withDefault([]),
  filters: getFiltersStateParser<RequestWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

const RequestMainPage: React.FC = () => {
  const t = useTranslations('admin.request.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<RequestWithRelations, Prisma.RequestFindManyArgs, Prisma.RequestCountArgs>({
    search,
    useCountHook: useCountRequest,
    useFindManyHook: useFindManyRequest,
    defaultArgs: RequestDefaultArgs,
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
          <DataTableToolbarActions table={table} exportFilename="requests" entityLabel={t('entityLabel')} />
        </DataTableAdvancedToolbar>
      </DataTable>
    </DataTableShell>
  );
};

interface GetTableConfigurationProps {
  t: ReturnType<typeof useTranslations>;
}

function getTableConfiguration({ t }: GetTableConfigurationProps) {
  const columns: ColumnDef<RequestWithRelations>[] = [
    {
      accessorKey: 'issueSubject',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.issueSubject')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    /*{
      accessorKey: 'priority',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.priority')} />,
      cell: ({ cell }) => cell.getValue(),
    },*/
    /*{
      accessorKey: 'status.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
      cell: ({ cell }) => cell.getValue(),
    },*/
    /*{
      accessorKey: 'requestCategory.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.requestCategory')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'assignmentCategory.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.assignmentCategory')} />,
      cell: ({ cell }) => cell.getValue(),
    },*/
    /* {
      accessorKey: 'client.person',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.client')} />,
      cell: ({ cell }) => {
        const person = cell.getValue() as { firstName: string; lastName: string };
        return `${person.firstName} ${person.lastName}`;
      },
    },*/
    {
      accessorKey: '_count.documents',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.documents')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: '_count.requestAssignments',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.requestAssignments')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: '_count.complianceTrackings',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.complianceTrackings')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      id: 'actions',
      cell: (data) => <ActionCell cell={data} onDelete={() => console.log('Delete', data.row.original)} onUpdate={() => console.log('Update', data.row.original)} />,
      size: 20,
    },
  ];

  const filterFields: DataTableFilterField<RequestWithRelations>[] = [
    { id: 'issueSubject', label: t('filters.issueSubject'), placeholder: t('filters.issueSubjectPlaceholder') },
    //{ id: 'priority', label: t('filters.priority'), placeholder: t('filters.priorityPlaceholder') },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<RequestWithRelations>[] = [
    { id: 'issueSubject', label: t('filters.issueSubject'), type: 'text' },
    // { id: 'priority', label: t('filters.priority'), type: 'text' },
    //{ id: 'status', label: t('filters.status'), type: 'text' },
    //{ id: 'requestCategory', label: t('filters.requestCategory'), type: 'text' },
    //{ id: 'assignmentCategory', label: t('filters.assignmentCategory'), type: 'text' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(RequestMainPage);
