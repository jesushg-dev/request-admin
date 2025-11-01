'use client';

import React, { memo, useMemo } from 'react';
import Image from 'next/image';
import { useCountUserTenant, useFindManyUserTenant } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import { Prisma } from '@zenstackhq/runtime/models';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import useTenantId from '@/hooks/use-tenant-id';
import { Badge } from '@/components/ui/badge';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';
import { Hint } from '@/components/hint';

const UserTenantDefaultArgs = Prisma.validator<Prisma.UserTenantDefaultArgs>()({
  select: {
    id: true,
    person: {
      select: {
        firstName: true,
        lastName: true,
        image: true,
      },
    },
    user: {
      select: {
        username: true,
        email: true,
      },
    },
    userRoles: {
      select: {
        role: {
          select: {
            name: true,
          },
        },
      },
    },
    _count: {
      select: {
        userAreas: true,
        userRoles: true,
        assignedUsers: true,
      },
    },
  },
});

type UserWithRelations = Prisma.UserTenantGetPayload<typeof UserTenantDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<UserWithRelations>().withDefault([{ id: 'id', desc: false }]),
  filters: getFiltersStateParser<UserWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

interface UsersPageClientProps {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const UsersPageClient: React.FC<UsersPageClientProps> = ({ canCreate, canEdit, canDelete }) => {
  const tenantId = useTenantId();
  const t = useTranslations('admin.user.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<UserWithRelations, Prisma.UserTenantFindManyArgs, Prisma.UserTenantCountArgs>({
    search,
    useCountHook: useCountUserTenant,
    useFindManyHook: useFindManyUserTenant,
    defaultArgs: {
      ...UserTenantDefaultArgs,
      where: { tenantId },
    },
  });

  const { columns, filterFields, advancedFilterFields } = useMemo(() => getTableConfiguration({ t, canEdit, canDelete }), [t, canEdit, canDelete]);

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: true,
    initialState: {
      sorting: [{ id: 'id', desc: false }],
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
          <DataTableToolbarActions
            table={table}
            exportFilename="users"
            entityLabel={t('entityLabel')}
            addLink={canCreate ? {
              pathname: '/admin/[tenantId]/security/users/new',
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
  canEdit: boolean;
  canDelete: boolean;
}

function getTableConfiguration({ t, canEdit, canDelete }: GetTableConfigurationProps) {
  const columns: ColumnDef<UserWithRelations>[] = [
    {
      accessorKey: 'person',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.person')} />,
      cell: ({ row }) => {
        const person = row.original.person;
        const user = row.original.user;
        return (
          <div className="flex items-center gap-4">
            {person?.image && <Image src={person.image} alt={`${person.firstName} ${person.lastName}`} width={40} height={40} className="rounded-full" />}
            <div>
              <div className="font-medium">{person ? `${person.firstName} ${person.lastName}` : user.username}</div>
              <Badge variant="outline" className="mt-1">
                {user.email}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'userRoles',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.roles')} />,
      cell: ({ cell }) => {
        const roles = cell.getValue() as { role: { name: string } }[];
        const displayedRoles = roles.slice(0, 2); // Show only the first two roles
        const extraRoles = roles.length > 2 ? roles.length - 2 : 0;

        return (
          <div className="flex flex-wrap gap-1">
            {displayedRoles.map((role, index) => (
              <Badge key={index} variant="secondary">
                {role.role.name}
              </Badge>
            ))}
            {extraRoles > 0 && (
              <Hint
                label={roles
                  .slice(2)
                  .map((role) => role.role.name)
                  .join(', ')}>
                <Badge variant="outline" className="cursor-pointer">
                  +{extraRoles}
                </Badge>
              </Hint>
            )}
          </div>
        );
      },
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
      cell: ({ row }) => (
        <ActionCell
          row={row}
          onDelete={canDelete ? console.log : undefined}
          onUpdate={canEdit ? console.log : undefined}
        />
      ),
      size: 20,
    },
  ];

  const filterFields: DataTableFilterField<UserWithRelations>[] = [
    /*{ id: 'person.firstName', label: t('filters.firstName'), placeholder: t('filters.firstNamePlaceholder') },
    { id: 'person.lastName', label: t('filters.lastName'), placeholder: t('filters.lastNamePlaceholder') },
    { id: 'user.username', label: t('filters.username'), placeholder: t('filters.usernamePlaceholder') },
    { id: 'user.email', label: t('filters.email'), placeholder: t('filters.emailPlaceholder') },*/
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<UserWithRelations>[] = [
    /*{ id: 'person.firstName', label: t('filters.firstName'), type: 'text' },
    { id: 'person.lastName', label: t('filters.lastName'), type: 'text' },
    { id: 'user.username', label: t('filters.username'), type: 'text' },
    { id: 'user.email', label: t('filters.email'), type: 'text' },*/
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(UsersPageClient);

