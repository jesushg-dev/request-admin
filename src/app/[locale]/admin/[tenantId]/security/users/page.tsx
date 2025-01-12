'use client';

import React, { memo, useMemo } from 'react';
import { useCountUser, useFindManyUser } from '@/services/api/hooks';
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

const UserDefaultArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    username: true,
    email: true,
    emailVerified: true,
    isTwoFactorEnabled: true,
    personId: true,
    userRoles: { select: { role: { select: { name: true } } } },
    _count: { select: { userAreas: true, userRoles: true, requestAssignments: true } },
  },
});

type UserWithRelations = Prisma.UserGetPayload<typeof UserDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<UserWithRelations>().withDefault([{ id: 'username', desc: false }]),
  filters: getFiltersStateParser<UserWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

const UserMainPage: React.FC = () => {
  const t = useTranslations('admin.user.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<UserWithRelations, Prisma.UserFindManyArgs, Prisma.UserCountArgs>({
    search,
    useCountHook: useCountUser,
    useFindManyHook: useFindManyUser,
    defaultArgs: UserDefaultArgs,
  });

  const { columns, filterFields, advancedFilterFields } = useMemo(() => getTableConfiguration({ t }), [t]);

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: true,
    initialState: {
      sorting: [{ id: 'username', desc: false }],
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
          <DataTableToolbarActions table={table} exportFilename="users" entityLabel={t('entityLabel')} />
        </DataTableAdvancedToolbar>
      </DataTable>
    </DataTableShell>
  );
};

interface GetTableConfigurationProps {
  t: ReturnType<typeof useTranslations>;
}

export function getTableConfiguration({ t }: GetTableConfigurationProps) {
  const columns: ColumnDef<UserWithRelations>[] = [
    {
      accessorKey: 'username',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.username')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.email')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'emailVerified',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.emailVerified')} />,
      cell: ({ cell }) => (cell.getValue() ? t('common.yes') : t('common.no')),
    },
    {
      accessorKey: 'isTwoFactorEnabled',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.isTwoFactorEnabled')} />,
      cell: ({ cell }) => (cell.getValue() ? t('common.enabled') : t('common.disabled')),
    },
    {
      accessorKey: 'userRoles',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.roles')} />,
      cell: ({ cell }) => (cell.getValue() as { role: { name: string } }[]).map((role) => role.role.name).join(', '),
    },
    {
      accessorKey: '_count.userAreas',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.userAreas')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: '_count.requestAssignments',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.requestAssignments')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      id: 'actions',
      cell: (data) => <ActionCell cell={data} onDelete={console.log} onUpdate={console.log} />,
      size: 20,
    },
  ];

  const filterFields: DataTableFilterField<UserWithRelations>[] = [
    { id: 'username', label: t('filters.username'), placeholder: t('filters.usernamePlaceholder') },
    { id: 'email', label: t('filters.email'), placeholder: t('filters.emailPlaceholder') },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<UserWithRelations>[] = [
    { id: 'username', label: t('filters.username'), type: 'text' },
    { id: 'email', label: t('filters.email'), type: 'text' },
    { id: 'emailVerified', label: t('filters.emailVerified'), type: 'boolean' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(UserMainPage);
