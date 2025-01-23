'use client';

import React, { memo, useMemo } from 'react';
import { Link } from '@/i18n/routing';
import { useCountRequest, useFindManyRequest } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import { Prisma } from '@prisma/client';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryState, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import useTenantId from '@/hooks/use-tenant-id';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';
import { KanbanBoard } from '@/components/kanban/kanban-board';

const RequestDefaultArgs = Prisma.validator<Prisma.RequestDefaultArgs>()({
  select: {
    id: true,
    issueSubject: true,
    description: true,
    priority: true,
    status: {
      select: {
        name: true,
      },
    },
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
      },
      take: 1,
      orderBy: {
        createdAt: 'desc',
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
  sort: getSortingStateParser<RequestWithRelations>().withDefault([{ id: 'priority', desc: true }]),
  filters: getFiltersStateParser<RequestWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

const RequestMainPage: React.FC = () => {
  const tenantId = useTenantId();
  const t = useTranslations('admin.request.main');
  const [search] = useQueryStates(searchParamsParsers);
  const [view, setView] = useQueryState('task-view', {
    defaultValue: 'table',
  });

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
      sorting: [{ id: 'priority', desc: true }],
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
    <Tabs defaultValue={view} onValueChange={setView} className="flex w-full flex-1 flex-col gap-4 overflow-auto p-4">
      <div className="flex w-full items-center justify-between gap-y-2 lg:flex-row">
        <TabsList className="h-8 w-full lg:w-auto">
          <TabsTrigger value="table" className="h-7 text-xs">
            Table
          </TabsTrigger>
          <TabsTrigger value="kanban" className="h-7 text-xs">
            Kanban
          </TabsTrigger>
          <TabsTrigger value="calendar" className="h-7 text-xs">
            Calendar
          </TabsTrigger>
        </TabsList>
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link
            href={{
              pathname: '/admin/[tenantId]/requests-portal/requests/new',
              params: { tenantId },
            }}>
            <Plus className="size-4" aria-hidden="true" />
            {t('new')}
          </Link>
        </Button>
      </div>
      <Separator orientation="horizontal" />
      <TabsContent value="table" className={`mt-0 ${view === 'table' ? 'flex flex-1' : ''}`}>
        <DataTableShell className="p-0" table={table} floatingBar={<DataTableFloatingBar table={table} />}>
          <DataTable table={table} isLoading={isLoading}>
            <DataTableAdvancedToolbar table={table} filterFields={advancedFilterFields} shallow={false}>
              <DataTableToolbarActions table={table} exportFilename="requests" entityLabel={t('entityLabel')} />
            </DataTableAdvancedToolbar>
          </DataTable>
        </DataTableShell>
      </TabsContent>
      <TabsContent value="kanban" className={`mt-0 ${view === 'kanban' ? 'flex flex-1' : ''}`}>
        <div className="flex flex-1 overflow-hidden border-2 border-red-800">
          <KanbanBoard />
        </div>
      </TabsContent>
      <TabsContent value="calendar" className={`mt-0 ${view === 'calendar' ? 'flex flex-1' : ''}`}>
        {/*<DataCalendar data={tasks?.documents ?? []} /> */}
      </TabsContent>
    </Tabs>
  );
};

interface GetTableConfigurationProps {
  t: ReturnType<typeof useTranslations>;
}

export function getTableConfiguration({ t }: GetTableConfigurationProps) {
  const columns: ColumnDef<RequestWithRelations>[] = [
    {
      accessorKey: 'issueSubject',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.issueSubject')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.priority')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'status.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'requestCategory.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.requestCategory')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'assignmentCategory.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.assignmentCategory')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'client.person',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.client')} />,
      cell: ({ cell }) => {
        const person = cell.getValue() as { firstName: string; lastName: string };
        return `${person.firstName} ${person.lastName}`;
      },
    },
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
    { id: 'priority', label: t('filters.priority'), placeholder: t('filters.priorityPlaceholder') },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<RequestWithRelations>[] = [
    { id: 'issueSubject', label: t('filters.issueSubject'), type: 'text' },
    { id: 'priority', label: t('filters.priority'), type: 'text' },
    { id: 'status', label: t('filters.status'), type: 'text' },
    { id: 'requestCategory', label: t('filters.requestCategory'), type: 'text' },
    { id: 'assignmentCategory', label: t('filters.assignmentCategory'), type: 'text' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(RequestMainPage);
