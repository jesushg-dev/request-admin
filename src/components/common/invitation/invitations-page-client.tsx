'use client';

import React, { useMemo, useTransition } from 'react';
import { Prisma } from '@zenstackhq/runtime/models';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';
import { toast } from 'sonner';
import { XIcon } from 'lucide-react';

import { useCountInvitationTenant, useFindManyInvitationTenant } from '@/services/api/hooks/invitation-tenant';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import { useDataTable } from '@/hooks/use-data-table';
import useTenantId from '@/hooks/use-tenant-id';
import { cancelInvitation } from '@/actions/organization';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { Badge } from '@/components/ui/badge';

// Default selection for InvitationTenant
const InvitationTenantDefaultArgs = Prisma.validator<Prisma.InvitationTenantDefaultArgs>()({
  select: {
    id: true,
    email: true,
    role: true,
    status: true,
    expiresAt: true,
    createdAt: true,
    inviter: { select: { id: true } },
    tenantId: true,
  },
});

type InvitationWithRelations = Prisma.InvitationTenantGetPayload<typeof InvitationTenantDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<InvitationWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<InvitationWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

interface InvitationsPageClientProps {
  canCreateUser: boolean;
}

const InvitationsPageClient: React.FC<InvitationsPageClientProps> = ({ canCreateUser }) => {
  const tenantId = useTenantId();
  const t = useTranslations('admin.invitation.main');
  const [isPending, startTransition] = useTransition();
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<
    InvitationWithRelations,
    Prisma.InvitationTenantFindManyArgs,
    Prisma.InvitationTenantCountArgs
  >({
    search,
    useFindManyHook: useFindManyInvitationTenant,
    useCountHook: useCountInvitationTenant,
    defaultArgs: {
      ...InvitationTenantDefaultArgs,
      where: { tenantId },
    },
  });

  const { columns, filterFields, advancedFilterFields } = useMemo(
    () => getTableConfiguration({ t, isPending, refetch, startTransition }),
    [t, isPending, refetch]
  );

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: true,
    initialState: {
      sorting: [{ id: 'expiresAt', desc: false }],
      columnPinning: { right: ['actions'] },
    },
    shallow: false,
    clearOnDefault: true,
    getRowCanExpand: () => false,
    getRowId: (row) => row.id,
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
            exportFilename="invitations"
            entityLabel={t('entityLabel', { default: 'Invitations' })}
            addLink={canCreateUser ? {
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
  isPending: boolean;
  refetch: () => void;
  startTransition: ReturnType<typeof useTransition>[1];
}

function getTableConfiguration({ t, isPending, refetch, startTransition }: GetTableConfigurationProps) {
  const columns: ColumnDef<InvitationWithRelations>[] = [
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.email')} />,
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.role')} />,
      cell: ({ cell }) => cell.getValue() || '-',
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} />,
      cell: ({ cell }) => <Badge variant="outline">{String(cell.getValue())}</Badge>,
    },
    {
      accessorKey: 'expiresAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.expiresAt')} />,
      cell: ({ cell }) => {
        const v = cell.getValue() as unknown as string | Date;
        return new Date(v as any).toLocaleString();
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const invitation = row.original;

        const handleCancel = () => {
          if (invitation.status === 'accepted' || invitation.status === 'rejected') {
            const message = t('messages.cannotCancel').replace('{status}', String(invitation.status));
            toast.error(message);
            return;
          }

          startTransition(async () => {
            const promise = cancelInvitation(invitation.id);
            toast.promise(promise, {
              loading: t('messages.cancelling'),
              success: () => {
                refetch();
                return t('messages.cancelSuccess');
              },
              error: (err: any) => {
                return t('messages.cancelError').replace('{error}', err.message);
              },
            });
          });
        };

        return invitation.status === 'pending' ? (
          <ActionCell row={row}>
            <DropdownMenuItem onSelect={handleCancel} disabled={isPending}>
              <XIcon className="size-4" aria-hidden="true" />
              {t('actions.cancel')}
            </DropdownMenuItem>
          </ActionCell>
        ) : null;
      },
      size: 20,
    },
  ];

  const filterFields: DataTableFilterField<InvitationWithRelations>[] = [
    { id: 'email', label: t('filters.email'), placeholder: t('filters.emailPlaceholder') },
    { id: 'role', label: t('filters.role'), placeholder: t('filters.rolePlaceholder') },
    { id: 'status', label: t('filters.status'), placeholder: t('filters.statusPlaceholder') },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<InvitationWithRelations>[] = [
    { id: 'email', label: t('filters.email'), type: 'text' },
    { id: 'role', label: t('filters.role'), type: 'text' },
    { id: 'status', label: t('filters.status'), type: 'text' },
    { id: 'expiresAt', label: t('filters.expiresAt'), type: 'date' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default InvitationsPageClient;


