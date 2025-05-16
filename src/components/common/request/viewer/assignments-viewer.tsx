'use client';

import React, { memo, useMemo } from 'react';
import { Link } from '@/i18n/routing';
import { useCountRequestAssignment, useFindManyRequestAssignment } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { Rotate3DIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

import { UserAssignmentModal } from './user-assignment-modal';

export const RequestAssignmentDefaultArgs = Prisma.validator<Prisma.RequestAssignmentDefaultArgs>()({
  select: {
    id: true,
    comment: true,
    assignmentDate: true,
    unAssignmentDate: true,
    assignedUsers: {
      select: {
        id: true,
        role: true,
        userTenant: {
          select: {
            user: { select: { id: true, username: true } },
            person: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    },
    slaStart: true,
    slaDeadline: true,
    slaEnd: true,
    area: { select: { id: true, name: true } },
    status: { select: { id: true, name: true } },
    priority: { select: { id: true, name: true } },
    isActive: true,
    requestCategory: { select: { id: true, name: true } },
    assignmentCategory: { select: { id: true, name: true } },
  },
});

export type AssignmentData = Prisma.RequestAssignmentGetPayload<typeof RequestAssignmentDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(100),
  sort: getSortingStateParser<AssignmentData>().withDefault([{ id: 'assignmentDate', desc: false }]),
  filters: getFiltersStateParser<AssignmentData>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

interface AssignmentHistoryDataTableProps {
  tenantId: string;
  requestId: string;
}

const AssignmentHistoryDataTable: React.FC<AssignmentHistoryDataTableProps> = ({ tenantId, requestId }) => {
  const t = useTranslations('admin.request.view.assignments');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<AssignmentData, Prisma.RequestAssignmentFindManyArgs, Prisma.RequestAssignmentCountArgs>({
    search,
    useCountHook: useCountRequestAssignment,
    useFindManyHook: useFindManyRequestAssignment,
    defaultArgs: {
      ...RequestAssignmentDefaultArgs,
      where: { tenantId, requestId },
    },
  });

  const { columns } = useMemo(() => getTableConfiguration({ t }), [t]);

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount,
    enableAdvancedFilter: true,
    initialState: {
      sorting: [{ id: 'assignmentDate', desc: false }],
      columnVisibility: {
        slaStart: false,
        slaDeadline: false,
        slaEnd: false,
        timeElapsed: false,
        remainingTime: false,
      },
    },
  });

  if (isError && error) return <ErrorRetryFallback error={error} onRetry={refetch} />;

  return (
    <DataTableShell table={table}>
      <DataTable table={table} isLoading={isLoading}>
        <DataTableAdvancedToolbar table={table} isFilterHidden isSortHidden isDateRangeHidden>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link
                href={{
                  pathname: '/admin/[tenantId]/requests/[slug]/edit',
                  query: { reassign: 'true' },
                  params: { tenantId, slug: requestId },
                }}>
                <Rotate3DIcon className="h-4 w-4 mr-2" />
                {t('reassignArea')}
              </Link>
            </Button>
            <UserAssignmentModal />
            <DataTableToolbarActions table={table} entityLabel={t('entityLabel')} />
          </div>
        </DataTableAdvancedToolbar>
      </DataTable>
    </DataTableShell>
  );
};

interface GetTableConfigurationProps {
  t: ReturnType<typeof useTranslations>;
}

function getTableConfiguration({ t }: GetTableConfigurationProps) {
  const columns: ColumnDef<AssignmentData>[] = [
    {
      id: 'area',
      accessorKey: 'area.name',
      header: t('columns.area'),
      meta: { group: 'basic' },
    },
    {
      id: 'usuarios',
      header: t('columns.users'),
      cell: ({ row }) => {
        const users = row.original.assignedUsers;
        return users.map((user) => (user.userTenant.person ? `${user.userTenant.person.firstName} ${user.userTenant.person.lastName}` : `@${user.userTenant.user.username}`)).join(', ');
      },
      meta: { group: 'basic' },
    },
    {
      id: 'assignmentDate',
      accessorFn: (row) => formatDate(row.assignmentDate),
      header: t('columns.assignmentDate'),
      meta: { group: 'basic' },
    },
    {
      id: 'unAssignmentDate',
      accessorFn: (row) => (row.unAssignmentDate ? formatDate(row.unAssignmentDate) : 'N/A'),
      header: t('columns.unAssignmentDate'),
      meta: { group: 'basic' },
    },
    {
      id: 'requestCategory',
      accessorKey: 'requestCategory.name',
      header: t('columns.requestCategory'),
      cell: ({ row }) => <Badge variant="outline">{row.original.requestCategory?.name ?? 'N/A'}</Badge>,
      meta: { group: 'categories' },
    },
    {
      id: 'assignmentCategory',
      accessorKey: 'assignmentCategory.name',
      header: t('columns.assignmentCategory'),
      cell: ({ row }) => <Badge variant="outline">{row.original.assignmentCategory?.name ?? 'N/A'}</Badge>,
      meta: { group: 'categories' },
    },
    {
      id: 'slaStart',
      accessorFn: (row) => (row.slaStart ? formatDate(row.slaStart) : 'N/A'),
      header: t('columns.slaStart'),
      meta: { group: 'sla' },
    },
    {
      id: 'slaDeadline',
      accessorFn: (row) => (row.slaDeadline ? formatDate(row.slaDeadline) : 'N/A'),
      header: t('columns.slaDeadline'),
      meta: { group: 'sla' },
    },
    {
      id: 'slaEnd',
      accessorFn: (row) => (row.slaEnd ? formatDate(row.slaEnd) : 'N/A'),
      header: t('columns.slaEnd'),
      meta: { group: 'sla' },
    },
    {
      id: 'timeElapsed',
      header: t('columns.timeElapsed'),
      cell: ({ row }) => {
        const assignment = row.original;
        const slaStart = assignment.slaStart ? new Date(assignment.slaStart) : null;
        const slaDeadline = assignment.slaDeadline ? new Date(assignment.slaDeadline) : null;
        const slaEnd = assignment.slaEnd ? new Date(assignment.slaEnd) : null;

        const timeElapsed =
          slaStart && slaDeadline ? (slaEnd ? Math.round((slaEnd.getTime() - slaStart.getTime()) / (1000 * 60 * 60)) : Math.round((Date.now() - slaStart.getTime()) / (1000 * 60 * 60))) : 'N/A';

        return typeof timeElapsed === 'number' ? `${timeElapsed} h` : timeElapsed;
      },
      meta: { group: 'sla' },
    },
    {
      id: 'remainingTime',
      header: t('columns.remainingTime'),
      cell: ({ row }) => {
        const assignment = row.original;
        const slaStart = assignment.slaStart ? new Date(assignment.slaStart) : null;
        const slaDeadline = assignment.slaDeadline ? new Date(assignment.slaDeadline) : null;
        const slaEnd = assignment.slaEnd ? new Date(assignment.slaEnd) : null;

        const remainingTime = slaStart && slaDeadline ? (slaEnd ? 0 : Math.round((slaDeadline.getTime() - Date.now()) / (1000 * 60 * 60))) : 'N/A';

        return typeof remainingTime === 'number' ? (remainingTime > 0 ? `${remainingTime} h` : t('expired')) : remainingTime;
      },
      meta: { group: 'sla' },
    },
    {
      id: 'comments',
      accessorKey: 'comment',
      header: t('columns.comments'),
      cell: ({ row }) => row.original.comment || t('noComments'),
      meta: { group: 'comments' },
    },
  ];

  return { columns };
}

export default memo(AssignmentHistoryDataTable);
