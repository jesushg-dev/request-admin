'use client';

import React, { memo, useMemo } from 'react';
import { Link } from '@/i18n/routing';
import { useCountRelatedIncident, useFindManyRelatedIncident } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { FileSymlinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import { Button } from '@/components/ui/button';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

export const RelatedIncidentDefaultArgs = Prisma.validator<Prisma.RelatedIncidentDefaultArgs>()({
  select: {
    id: true,
    createdAt: true,
    request: { select: { id: true, issueSubject: true } },
  },
});

export type RelatedIncident = Prisma.RelatedIncidentGetPayload<typeof RelatedIncidentDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(100),
  sort: getSortingStateParser<RelatedIncident>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<RelatedIncident>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

interface RelatedViewerProps {
  tenantId: string;
  requestId: string;
}

const RelatedViewer: React.FC<RelatedViewerProps> = ({ tenantId, requestId }) => {
  const t = useTranslations('admin.request.view.related');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<RelatedIncident, Prisma.RelatedIncidentFindManyArgs, Prisma.RelatedIncidentCountArgs>({
    search,
    useCountHook: useCountRelatedIncident,
    useFindManyHook: useFindManyRelatedIncident,
    defaultArgs: {
      ...RelatedIncidentDefaultArgs,
      where: { tenantId, requestId },
    },
  });

  const { columns } = useMemo(() => getTableConfiguration({ t }), [t]);

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount,
    enableAdvancedFilter: true,
    initialState: {
      sorting: [{ id: 'createdAt', desc: true }],
    },
  });

  if (isError && error) return <ErrorRetryFallback error={error} onRetry={refetch} />;

  return (
    <DataTableShell table={table}>
      <DataTable table={table} isLoading={isLoading}>
        <DataTableAdvancedToolbar table={table} isFilterHidden isSortHidden isDateRangeHidden>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link
                href={{
                  pathname: '/admin/[tenantId]/requests-portal/requests/[slug]/relate',
                  params: { tenantId, slug: requestId },
                }}>
                <FileSymlinkIcon className="h-4 w-4 mr-2" />
                {t('relateRequest')}
              </Link>
            </Button>
            <DataTableToolbarActions table={table} entityLabel={t('entityLabel')} exportFilename="related-incidents" />
          </div>
        </DataTableAdvancedToolbar>
      </DataTable>
    </DataTableShell>
  );
};

interface GetTableConfigurationProps {
  t: ReturnType<typeof useTranslations>;
}

function getTableConfiguration({ t }: GetTableConfigurationProps) {
  const columns: ColumnDef<RelatedIncident>[] = [
    {
      id: 'relatedId',
      accessorKey: 'request.id',
      header: t('columns.relatedId'),
      size: 120,
      cell: ({ row }) => row.original.request.id,
    },
    {
      id: 'issueSubject',
      accessorKey: 'request.issueSubject',
      header: t('columns.issueSubject'),
      cell: ({ row }) => row.original.request.issueSubject || t('noSubject'),
    },
    {
      id: 'createdAt',
      accessorFn: (row) => formatDate(row.createdAt),
      header: t('columns.createdAt'),
    },
  ];

  return { columns };
}

export default memo(RelatedViewer);

/*const RenderCardView = ({ data }: RenderViewProps) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {data.map((incident) => (
      <Card key={incident.id} className="bg-secondary/10">
        <CardHeader>
          <CardTitle>{incident.request.issueSubject}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>ID:</strong> {incident.id}
          </p>
          <p>
            <strong>Request ID:</strong> {incident.request.id}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
);
*/
