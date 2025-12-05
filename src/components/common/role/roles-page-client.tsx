'use client';

import React, { memo, useMemo } from 'react';
import { useCountRole, useFindManyRole } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Prisma } from '@zenstackhq/runtime/models';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';
import { useTenantContext } from '@/components/hoc/tenant-provider';

const RoleDefaultArgs = Prisma.validator<Prisma.RoleDefaultArgs>()({
  select: {
    id: true,
    tenantId: true,
    name: true,
    description: true,
    createdAt: true,
    roleFeature: {
      select: {
        feature: {
          select: {
            name: true,
            module: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    },
    _count: {
      select: {
        userRole: true,
        roleFeature: true,
      },
    },
  },
});

type RoleWithRelations = Prisma.RoleGetPayload<typeof RoleDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<RoleWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<RoleWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

interface RolesPageClientProps {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const RolesPageClient: React.FC<RolesPageClientProps> = ({ canCreate, canEdit, canDelete }) => {
  const { tenantId } = useTenantContext();
  const t = useTranslations('admin.role.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<RoleWithRelations, Prisma.RoleFindManyArgs, Prisma.RoleCountArgs>({
    search,
    useCountHook: useCountRole,
    useFindManyHook: useFindManyRole,
    defaultArgs: {
      ...RoleDefaultArgs,
      where: { tenantId },
    },
  });

  const { columns, filterFields, advancedFilterFields } = useMemo(() => getTableConfiguration({ t, tenantId, canEdit, canDelete }), [t, tenantId, canEdit, canDelete]);

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
            exportFilename="roles"
            entityLabel={t('entityLabel')}
            addLink={
              canCreate
                ? {
                    pathname: '/admin/[tenantId]/security/roles/new',
                    params: { tenantId },
                  }
                : undefined
            }
          />
        </DataTableAdvancedToolbar>
      </DataTable>
    </DataTableShell>
  );
};

interface GetTableConfigurationProps {
  t: ReturnType<typeof useTranslations>;
  tenantId: string;
  canEdit: boolean;
  canDelete: boolean;
}

function getTableConfiguration({ t, tenantId, canEdit, canDelete }: GetTableConfigurationProps) {
  const columns: ColumnDef<RoleWithRelations>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.description')} />,
      cell: ({ cell }) => cell.getValue() ?? 'N/A',
    },
    {
      accessorKey: '_count.userRole',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.userCount')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: '_count.roleFeature',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.featureCount')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.createdAt')} />,
      cell: ({ cell }) => formatDate(cell.getValue() as Date),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ActionCell
          row={row}
          onDelete={canDelete ? () => console.log('Delete', row.original) : undefined}
          updateLink={
            canEdit
              ? {
                  pathname: '/admin/[tenantId]/security/roles/[slug]/edit',
                  params: { tenantId, slug: row.original.id },
                }
              : undefined
          }
        />
      ),
      size: 20,
    },
  ];

  const filterFields: DataTableFilterField<RoleWithRelations>[] = [
    { id: 'name', label: t('filters.name'), placeholder: t('filters.namePlaceholder') },
    { id: 'description', label: t('filters.description'), placeholder: t('filters.descriptionPlaceholder') },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<RoleWithRelations>[] = [
    { id: 'name', label: t('filters.name'), type: 'text' },
    { id: 'description', label: t('filters.description'), type: 'text' },
    { id: 'createdAt', label: t('filters.createdAt'), type: 'date' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(RolesPageClient);
