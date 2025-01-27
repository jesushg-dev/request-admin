'use client';

import React, { useMemo } from 'react';
import { useCountFormSubmission, useFindManyFormSubmission } from '@/services/api/hooks';
import { FormSubmission, Prisma } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { format, formatDistance } from 'date-fns';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import { DynamicColumn } from '@/types/prisma/form';
import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
//import FormLinkShare from '@/components/builder-form/form-link-share';
//import VisitBtn from '@/components/builder-form/visit-btn';
import { DataTable, DataTableShell, DataTableStatsToggle, DataTableStatsWrapper } from '@/components/data-table/data-table';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<FormSubmission>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<FormSubmission>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
};

interface DynamicDataTableProps {
  tenantId: string;
  slug: string;
  name: string;
  columns: DynamicColumn[];
  children: React.ReactNode;
}

type Column = {
  submittedAt: string;
  [key: string]: string | number | Date;
};

const DynamicDataTable: React.FC<DynamicDataTableProps> = ({ tenantId, slug, name, columns, children }) => {
  const t = useTranslations('admin.formBuilder.view');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isError, error, refetch, isLoading, pageCount } = useFetchTableData<FormSubmission, Prisma.FormSubmissionFindManyArgs, Prisma.FormSubmissionCountArgs>({
    search,
    useCountHook: useCountFormSubmission,
    useFindManyHook: useFindManyFormSubmission,
    defaultArgs: { where: { form: { AND: [{ tenantId }, { id: slug }] } } },
  });

  const { tableColumns } = useMemo(() => getTableConfiguration({ t, columns }), [t, columns]);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.map((submission) => {
      const content = JSON.parse(submission.content);
      return {
        ...content,
        submittedAt: submission.createdAt,
      };
    });
  }, [data]);

  const { table } = useDataTable({
    data: rows,
    pageCount,
    columns: tableColumns,
    enableAdvancedFilter: true,
    getRowId: (row) => row.submittedAt,
  });

  if (isError && error) {
    return <ErrorRetryFallback error={error} onRetry={refetch} />;
  }

  return (
    <DataTableShell table={table}>
      <DataTable table={table} isLoading={isLoading}>
        <DataTableAdvancedToolbar table={table} filterFields={[]} shallow={false}>
          <DataTableStatsToggle />
          <DataTableToolbarActions
            table={table}
            exportFilename="users"
            entityLabel={name}
            addLink={{
              pathname: '/admin/[tenantId]/form-designer/[slug]/new',
              params: { tenantId, slug },
            }}
          />
        </DataTableAdvancedToolbar>
        <DataTableStatsWrapper>{children}</DataTableStatsWrapper>
      </DataTable>
    </DataTableShell>
  );
};

interface GetTableConfigurationProps {
  columns: DynamicColumn[];
  t: ReturnType<typeof useTranslations>;
}

export function getTableConfiguration({ t, columns }: GetTableConfigurationProps) {
  const tableColumns: ColumnDef<Column>[] = columns.map(
    (col) =>
      ({
        accessorKey: col.id,
        header: ({ column }) => <DataTableColumnHeader column={column} title={col.label} />,
        cell: ({ cell }) => {
          const value = cell.getValue();
          if (col.type === 'DateField') {
            return <Badge variant="outline">{value && !isNaN(Date.parse(value as string)) ? format(new Date(Date.parse(value as string)), 'dd/MM/yyyy') : 'N/A'}</Badge>;
          }
          if (col.type === 'CheckboxField') {
            return <Checkbox checked={value === 'true'} disabled />;
          }
          return value;
        },
      }) as ColumnDef<Column>
  );

  tableColumns.push({
    accessorKey: 'submittedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('submittedAt')} />,
    cell: ({ cell }) => {
      return formatDistance(new Date(cell.getValue() as string | number | Date), new Date(), {
        addSuffix: true,
      });
    },
  });

  return { tableColumns };
}

export default DynamicDataTable;
