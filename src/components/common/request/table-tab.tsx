'use client';

import React, { memo, useMemo, useEffect, useState } from 'react';
import { useCountRequest, useFindManyRequest } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import { Prisma } from '@zenstackhq/runtime/models';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import useTenantId from '@/hooks/use-tenant-id';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { getRequestsFilteredByAreaAccess } from '@/actions/request';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

const RequestDefaultArgs = Prisma.validator<Prisma.RequestDefaultArgs>()({
  select: {
    id: true,
    slug: true,
    tenantId: true,
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
        status: {
          select: {
            name: true,
          },
        },
        priority: {
          select: {
            name: true,
          },
        },
      },
      take: 1,
      orderBy: {
        createdAt: 'desc',
      },
    },
    dataroom: {
      select: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    },
    _count: {
      select: {
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
  sort: getSortingStateParser<RequestWithRelations>().withDefault([
    {
      desc: true,
      id: 'id',
    },
  ]),
  filters: getFiltersStateParser<RequestWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

const RequestMainPage: React.FC = () => {
  const tenantId = useTenantId();
  const t = useTranslations('admin.request.main');
  const [search] = useQueryStates(searchParamsParsers);
  const [baseWhereClause, setBaseWhereClause] = useState<any>(null);
  const [isLoadingWhere, setIsLoadingWhere] = useState(true);

  // Load filtered where clause from server ONCE on mount
  useEffect(() => {
    const loadWhereClause = async () => {
      setIsLoadingWhere(true);
      try {
        const where = await getRequestsFilteredByAreaAccess(tenantId);
        setBaseWhereClause(where);
      } catch (error) {
        console.error('Error loading where clause:', error);
        // Set empty filter on error - user sees nothing
        setBaseWhereClause({ id: { in: [] } });
      } finally {
        setIsLoadingWhere(false);
      }
    };

    loadWhereClause();
  }, [tenantId]);

  // Wait for where clause before fetching data
  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<RequestWithRelations, Prisma.RequestFindManyArgs, Prisma.RequestCountArgs>({
    search,
    useCountHook: useCountRequest,
    useFindManyHook: useFindManyRequest,
    defaultArgs: baseWhereClause ? {
      ...RequestDefaultArgs,
      where: baseWhereClause,
    } : {
      ...RequestDefaultArgs,
      where: { id: { in: [] } }, // Temporary empty filter while loading
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
      sorting: [
        {
          desc: true,
          id: 'id',
        },
      ],
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
    <DataTableShell className="p-0" table={table} floatingBar={<DataTableFloatingBar table={table} />}>
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
      accessorKey: 'slug',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.id')} />,
      cell: ({ row }) => {
        const slug = row.original.slug;
        return <span className="font-mono">#{slug ?? row.original.id.slice(0, 8)}</span>;
      },
    },
    {
      accessorKey: 'issueSubject',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.issueSubject')} />,
      cell: ({ cell }) => cell.getValue() ?? 'N/A',
    },
    {
      accessorKey: 'requestAssignments.0.priority.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.priority')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'requestAssignments.0.status.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'requestAssignments.0.requestCategory.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.requestCategory')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'requestAssignments.0.assignmentCategory.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.assignmentCategory')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    // TODO: Add client column once client data is available in the query
    /*{
      accessorKey: 'client.person',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.client')} />,
      cell: ({ cell }) => {
        const person = cell.getValue() as { firstName: string; lastName: string };
        return `${person.firstName} ${person.lastName}`;
      },
    },*/
    {
      accessorKey: 'dataroom._count.documents',
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
      cell: ({ row }) => (
        <ActionCell
          row={row}
          // TODO: Implement delete functionality for requests
          onDelete={() => console.log('Delete', row.original)}
          viewLink={{
            pathname: '/admin/[tenantId]/requests/[slug]',
            params: { tenantId: row.original.tenantId, slug: row.original.id },
          }}
        />
      ),
      size: 20,
    },
  ];

  const filterFields: DataTableFilterField<RequestWithRelations>[] = [
    { id: 'issueSubject', label: t('filters.issueSubject'), placeholder: t('filters.issueSubjectPlaceholder') },
    // TODO: Add priority filter once filter logic is implemented
    // { id: 'priority', label: t('filters.priority'), placeholder: t('filters.priorityPlaceholder') },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<RequestWithRelations>[] = [
    { id: 'issueSubject', label: t('filters.issueSubject'), type: 'text' },
    // TODO: Add advanced filters once filter logic is implemented for nested fields
    //   { id: 'priority', label: t('filters.priority'), type: 'text' },
    //  { id: 'status', label: t('filters.status'), type: 'text' },
    // { id: 'requestCategory', label: t('filters.requestCategory'), type: 'text' },
    // { id: 'assignmentCategory', label: t('filters.assignmentCategory'), type: 'text' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(RequestMainPage);
