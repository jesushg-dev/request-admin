'use client';

import React, { memo, useMemo } from 'react';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import type { MemberWithRelations } from '@/actions/organization';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { useListMembers } from '@/hooks/use-list-members';
import useTenantId from '@/hooks/use-tenant-id';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';
import { Hint } from '@/components/hint';

type UserWithRelations = MemberWithRelations;

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

  // Use Better Auth to fetch members
  const { data: membersResult, isLoading, isError, error, refetch } = useListMembers({
    organizationId: tenantId,
    page: search.page,
    perPage: search.perPage,
    sort: search.sort,
    filters: search.filters,
  });

  const data = membersResult?.data ?? [];
  const pageCount = membersResult?.pageCount ?? 0;

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
        const displayName = person ? `${person.firstName} ${person.lastName}` : user.username || user.email;
        const initials = person
          ? `${person.firstName?.[0] || ''}${person.lastName?.[0] || ''}`.toUpperCase()
          : user.email?.[0]?.toUpperCase() || 'U';
        
        return (
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={person?.image || undefined} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{displayName}</div>
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
      accessorKey: '_count.assignedUsers',
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

