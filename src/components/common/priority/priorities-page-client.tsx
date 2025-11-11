'use client';

import React, { memo, useMemo } from 'react';
import { useCountRequestPriorityType, useFindManyRequestPriorityType } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import { Prisma } from '@zenstackhq/runtime/models';
import { ColumnDef } from '@tanstack/react-table';
import { Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import { useTenantContext } from '@/components/hoc/tenant-provider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

const RequestPriorityTypeDefaultArgs = Prisma.validator<Prisma.RequestPriorityTypeDefaultArgs>()({
  select: {
    id: true,
    tenantId: true,
    name: true,
    description: true,
    primaryColor: true,
    level: true,
    createdAt: true,
    _count: {
      select: {
        assignments: {
          where: {
            isActive: true,
          },
        },
      },
    },
  },
});

type RequestPriorityTypeWithRelations = Prisma.RequestPriorityTypeGetPayload<typeof RequestPriorityTypeDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<RequestPriorityTypeWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<RequestPriorityTypeWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

interface PrioritiesPageClientProps {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const PrioritiesPageClient: React.FC<PrioritiesPageClientProps> = ({ canCreate, canEdit, canDelete }) => {
  const { tenantId } = useTenantContext();
  const t = useTranslations('admin.requestPriorityType');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<RequestPriorityTypeWithRelations, Prisma.RequestPriorityTypeFindManyArgs, Prisma.RequestPriorityTypeCountArgs>({
    search,
    useCountHook: useCountRequestPriorityType,
    useFindManyHook: useFindManyRequestPriorityType,
    defaultArgs: {
      ...RequestPriorityTypeDefaultArgs,
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
            exportFilename="RequestPriorityTypes"
            entityLabel={t('entityLabel')}
            addLink={canCreate ? { pathname: '/admin/[tenantId]/configurations/priorities/new', params: { tenantId } } : undefined}
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
  const columns: ColumnDef<RequestPriorityTypeWithRelations>[] = [
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
      cell: ({ row }) => (
        <div className="flex items-center">
          <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label={t('columns.selectRow')} className="mr-2" />
          <Badge style={{ backgroundColor: row.original.primaryColor, color: '#fff' }}>
            <Tag className="mr-1 h-3 w-3" />
            {row.original.name}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.description')} />,
    },
    {
      accessorKey: '_count.assignments',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.requests')} />,
      cell: ({ cell }) => `${cell.getValue()} ${t('columns.requests')}`,
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
          updateLink={canEdit ? {
            pathname: '/admin/[tenantId]/configurations/priorities/[slug]/edit',
            params: { tenantId, slug: row.original.id },
          } : undefined}
        />
      ),
    },
  ];

  const filterFields: DataTableFilterField<RequestPriorityTypeWithRelations>[] = [
    { id: 'name', label: t('filters.name'), placeholder: t('filters.namePlaceholder') },
    { id: 'description', label: t('filters.description'), placeholder: t('filters.descriptionPlaceholder') },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<RequestPriorityTypeWithRelations>[] = [
    { id: 'name', label: t('filters.name'), type: 'text' },
    { id: 'description', label: t('filters.description'), type: 'text' },
    { id: 'createdAt', label: t('filters.createdAt'), type: 'date' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(PrioritiesPageClient);

