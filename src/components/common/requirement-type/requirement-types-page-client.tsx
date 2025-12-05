'use client';

import React, { memo, useMemo } from 'react';
import { useCountRequirementType, useFindManyRequirementType } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Prisma } from '@zenstackhq/runtime/models';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import { Checkbox } from '@/components/ui/checkbox';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';
import { useTenantContext } from '@/components/hoc/tenant-provider';

const RequirementTypeDefaultArgs = Prisma.validator<Prisma.RequirementTypeDefaultArgs>()({
  select: {
    id: true,
    tenantId: true,
    name: true,
    description: true,
    createdAt: true,
  },
});

type RequirementTypeWithRelations = Prisma.RequirementTypeGetPayload<typeof RequirementTypeDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<RequirementTypeWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<RequirementTypeWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

interface RequirementTypesPageClientProps {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const RequirementTypesPageClient: React.FC<RequirementTypesPageClientProps> = ({ canCreate, canEdit, canDelete }) => {
  const { tenantId } = useTenantContext();
  const t = useTranslations('admin.requirementType');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<RequirementTypeWithRelations, Prisma.RequirementTypeFindManyArgs, Prisma.RequirementTypeCountArgs>({
    search,
    useCountHook: useCountRequirementType,
    useFindManyHook: useFindManyRequirementType,
    defaultArgs: {
      ...RequirementTypeDefaultArgs,
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

  if (isError && error) return <ErrorRetryFallback error={error} onRetry={refetch} />;

  return (
    <DataTableShell table={table} floatingBar={<DataTableFloatingBar table={table} />}>
      <DataTable table={table} isLoading={isLoading}>
        <DataTableAdvancedToolbar table={table} filterFields={advancedFilterFields} shallow={false}>
          <DataTableToolbarActions
            table={table}
            exportFilename="RequirementTypes"
            entityLabel={t('entityLabel')}
            addLink={canCreate ? { pathname: '/admin/[tenantId]/configurations/requirement-types/new', params: { tenantId } } : undefined}
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
  const columns: ColumnDef<RequirementTypeWithRelations>[] = [
    {
      id: 'name',
      header: ({ table, column }) => (
        <div className="flex items-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
            className="mr-2"
          />
          <DataTableColumnHeader column={column} title={t('columns.name')} />
        </div>
      ),
      cell: ({ row }) => <div className="flex items-center">{row.original.name}</div>,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.description')} />,
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
                  pathname: '/admin/[tenantId]/configurations/requirement-types/[slug]/edit',
                  params: { tenantId, slug: row.original.id },
                }
              : undefined
          }
        />
      ),
    },
  ];

  const filterFields: DataTableFilterField<RequirementTypeWithRelations>[] = [
    { id: 'name', label: t('filters.name'), placeholder: t('filters.namePlaceholder') },
    { id: 'description', label: t('filters.description'), placeholder: t('filters.descriptionPlaceholder') },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<RequirementTypeWithRelations>[] = [
    { id: 'name', label: t('filters.name'), type: 'text' },
    { id: 'description', label: t('filters.description'), type: 'text' },
    { id: 'createdAt', label: t('filters.createdAt'), type: 'date' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(RequirementTypesPageClient);
