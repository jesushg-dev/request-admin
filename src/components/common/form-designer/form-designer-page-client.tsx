'use client';

import React, { memo, useMemo } from 'react';
import { useCountForm, useFindManyForm } from '@/services/api/hooks';
import { DataTableAdvancedFilterField, DataTableFilterField } from '@/types';
import { Prisma } from '@zenstackhq/runtime/models';
import { ColumnDef, Row } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { FormDefaultArgs, type FormWithRelations } from '@/types/zenstackhq/form';
import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import { useTenantContext } from '@/components/hoc/tenant-provider';
import { Checkbox } from '@/components/ui/checkbox';
import { DraggableFormCard } from '@/components/builder-form/form-card';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFloatingBar } from '@/components/data-table/data-table-floating-bar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';
import { PermissionButton } from '@/components/shared/permission-button';

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<FormWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<FormWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

interface FormDesignerPageClientProps {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const FormDesignerPageClient: React.FC<FormDesignerPageClientProps> = ({ canCreate, canEdit, canDelete }) => {
  const { tenantId } = useTenantContext();
  const t = useTranslations('admin.form.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<FormWithRelations, Prisma.FormFindManyArgs, Prisma.FormCountArgs>({
    search,
    useCountHook: useCountForm,
    useFindManyHook: useFindManyForm,
    defaultArgs: {
      ...FormDefaultArgs,
      where: { tenantId },
    },
  });

  const { columns, card, filterFields, advancedFilterFields } = useMemo(() => getTableConfiguration({ t, canEdit, canDelete }), [t, canEdit, canDelete]);

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
      <DataTable table={table} isLoading={isLoading} customCard={card}>
        <DataTableAdvancedToolbar table={table} filterFields={advancedFilterFields} shallow={false}>
          <DataTableToolbarActions
            table={table}
            exportFilename="forms"
            entityLabel={t('entityLabel')}
            addLink={canCreate ? {
              pathname: '/admin/[tenantId]/form-designer/new',
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
  const columns: ColumnDef<FormWithRelations>[] = [
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

        return (
          <div
            style={{
              paddingLeft: `${row.depth * 1.5}rem`,
            }}
            className="flex items-center">
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label={t('columns.selectRow')} className="mr-2" />
            {hasSubRows && (
              <button onClick={row.getToggleExpandedHandler()} style={{ cursor: 'pointer' }} className="mr-2">
                {row.getIsExpanded() ? <ChevronUp className="size-4 shrink-0 opacity-50" /> : <ChevronDown className="size-4 shrink-0 opacity-50" />}
              </button>
            )}
            <span>{row.original.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.description')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'published',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.published')} />,
      cell: ({ cell }) => (cell.getValue() ? t('states.published') : t('states.draft')),
    },
    {
      accessorKey: 'visits',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.visits')} />,
      cell: ({ cell }) => cell.getValue(),
    },
    {
      accessorKey: 'submissions',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.submissions')} />,
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
          updateLink={canEdit ? {
            pathname: '/admin/[tenantId]/form-designer/[slug]/edit',
            params: { tenantId: row.original.tenantId, slug: row.original.id },
          } : undefined}
          viewLink={{
            pathname: '/admin/[tenantId]/form-designer/[slug]',
            params: { tenantId: row.original.tenantId, slug: row.original.id },
          }}
        />
      ),
      size: 20,
    },
  ];

  const card = ({ row }: { row: Row<FormWithRelations> }) => <DraggableFormCard data={row.original} />;

  const filterFields: DataTableFilterField<FormWithRelations>[] = [{ id: 'name', label: t('filters.name'), placeholder: t('filters.namePlaceholder') }];

  const advancedFilterFields: DataTableAdvancedFilterField<FormWithRelations>[] = [
    { id: 'name', label: t('filters.name'), type: 'text' },
    { id: 'createdAt', label: t('filters.createdAt'), type: 'date' },
    { id: 'published', label: t('filters.published'), type: 'boolean' },
  ];

  return { columns, card, filterFields, advancedFilterFields };
}

export default memo(FormDesignerPageClient);

