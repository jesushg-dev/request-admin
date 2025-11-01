'use client';

import React, { memo, useMemo } from 'react';
import { useCountRequestWorkflow, useFindManyRequestWorkflow } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import { Prisma } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import useTenantId from '@/hooks/use-tenant-id';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

const RequestWorkflowDefaultArgs = Prisma.validator<Prisma.RequestWorkflowDefaultArgs>()({
  select: {
    id: true,
    name: true,
    tenantId: true,
    isDefault: true,
    description: true,
    createdAt: true,
    updatedAt: true,
    _count: {
      select: {
        requestCategory: true,
        requestWorkflowTransition: true,
        requestWorkflowStatus: true,
      },
    },
  },
});

type RequestWorkflowWithCounts = Prisma.RequestWorkflowGetPayload<typeof RequestWorkflowDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<RequestWorkflowWithCounts>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<RequestWorkflowWithCounts>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

interface WorkflowsPageClientProps {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const WorkflowsPageClient: React.FC<WorkflowsPageClientProps> = ({ canCreate, canEdit, canDelete }) => {
  const tenantId = useTenantId();
  const t = useTranslations('admin.workflow.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<RequestWorkflowWithCounts, Prisma.RequestWorkflowFindManyArgs, Prisma.RequestWorkflowCountArgs>({
    search,
    useCountHook: useCountRequestWorkflow,
    useFindManyHook: useFindManyRequestWorkflow,
    defaultArgs: {
      ...RequestWorkflowDefaultArgs,
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
            exportFilename="workflows"
            entityLabel={t('entityLabel')}
            addLink={canCreate ? {
              pathname: '/admin/[tenantId]/configurations/workflows/new',
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
  tenantId: string;
  canEdit: boolean;
  canDelete: boolean;
}

function getTableConfiguration({ t, tenantId, canEdit, canDelete }: GetTableConfigurationProps) {
  const columns: ColumnDef<RequestWorkflowWithCounts>[] = [
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
      cell: ({ row }) => {
        const hasSubRows = row.getCanExpand();
        const workflow = row.original;

        return (
          <div className="flex items-center">
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} className="mr-2" />
            {hasSubRows && (
              <button onClick={row.getToggleExpandedHandler()} className="mr-2">
                {row.getIsExpanded() ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
            )}
            <div className="flex flex-col">
              <span className="font-medium">{workflow.name}</span>
              <span className="text-sm text-muted-foreground">{workflow.description}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'isDefault',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.default')} />,
      cell: ({ row }) => (
        <div className="flex items-center">
          <Checkbox checked={row.original.isDefault} disabled className="mr-2" />
          {row.original.isDefault ? t('badges.yes') : t('badges.no')}
        </div>
      ),
    },
    {
      accessorKey: 'requestCategories',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.requestTypes')} />,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original._count.requestCategory > 0 && (
            <Badge variant="outline">
              {row.original._count.requestCategory} {t('badges.categories')}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'statusCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.states')} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {row.original._count.requestWorkflowStatus} {t('badges.states')}
          </Badge>
          <Badge variant="outline">
            {row.original._count.requestWorkflowTransition} {t('badges.transitions')}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.lastModified')} />,
      cell: ({ cell }) => formatDate(cell.getValue() as Date),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ActionCell
          row={row}
          onDelete={canDelete ? () => console.log('Delete', row.original) : undefined}
          updateLink={canEdit ? {
            pathname: '/admin/[tenantId]/configurations/workflows/[slug]/edit',
            params: { tenantId, slug: row.original.id },
          } : undefined}
          viewLink={{
            pathname: '/admin/[tenantId]/configurations/workflows/[slug]',
            params: { tenantId, slug: row.original.id },
          }}
        />
      ),
      size: 20,
    },
  ];

  const filterFields: DataTableFilterField<RequestWorkflowWithCounts>[] = [{ id: 'name', label: t('filters.name'), placeholder: t('filters.namePlaceholder') }];

  const advancedFilterFields: DataTableAdvancedFilterField<RequestWorkflowWithCounts>[] = [
    { id: 'name', label: t('filters.name'), type: 'text' },
    { id: 'createdAt', label: t('filters.createdAt'), type: 'date' },
    { id: 'isDefault', label: t('filters.default'), type: 'boolean' },
  ];

  return { columns, filterFields, advancedFilterFields };
}

export default memo(WorkflowsPageClient);

