'use client';

import React, { useMemo } from 'react';
import { useCountLink, useFindManyLink } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import useTenantId from '@/hooks/use-tenant-id';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

const LinkDefaultArgs = Prisma.validator<Prisma.LinkDefaultArgs>()({
  include: {
    views: true,
    _count: {
      select: {
        views: true,
      },
    },
    customField: true,
    document: {
      select: {
        name: true,
      },
    },
    dataroom: {
      select: {
        name: true,
      },
    },
    agreement: {
      select: {
        name: true,
      },
    },
  },
});

type LinkWithRelations = Prisma.LinkGetPayload<typeof LinkDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<LinkWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<LinkWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

export default function LinkList() {
  const tenantId = useTenantId();
  const t = useTranslations('admin.link.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<LinkWithRelations, Prisma.LinkFindManyArgs, Prisma.LinkCountArgs>({
    search,
    useFindManyHook: useFindManyLink,
    useCountHook: useCountLink,
    defaultArgs: {
      ...LinkDefaultArgs,
      where: { tenantId },
    },
  });

  const { columns, card } = useMemo(() => getTableConfiguration({ t, tenantId }), [t, tenantId]);

  const { table } = useDataTable({
    data: data || [],
    columns,
    pageCount,
    enableRowSelection: false,
  });

  if (isError && error) return <ErrorRetryFallback error={error} onRetry={refetch} />;

  return (
    <DataTableShell table={table}>
      <DataTable
        table={table}
        isLoading={isLoading}
        customCard={card}
        emptyState={{
          title: t('table.empty'),
          description: t('description'),
        }}>
        <DataTableToolbarActions table={table} entityLabel={t('entityLabel')} />
      </DataTable>
    </DataTableShell>
  );
}

interface TableConfigProps {
  t: ReturnType<typeof useTranslations>;
  tenantId: string;
}

function getTableConfiguration({ t, tenantId }: TableConfigProps) {
  const columns: ColumnDef<LinkWithRelations>[] = [
    {
      accessorKey: 'name',
      header: t('table.name'),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.name || t('unnamed')}
          <div className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</div>
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: 'document',
      header: t('table.document'),
      cell: ({ row }) => row.original.document?.name || row.original.dataroom?.name || 'N/A',
      size: 150,
    },
    {
      accessorKey: 'views',
      header: t('table.views'),
      cell: ({ row }) => row.original._count.views,
      size: 100,
    },
    {
      accessorKey: 'security',
      header: t('table.security'),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.password && <Badge variant="outline">{t('security.password')}</Badge>}
          {row.original.emailProtected && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> {t('security.emailProtected')}
            </Badge>
          )}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: 'status',
      header: t('table.status'),
      cell: ({ row }) => <Badge variant={row.original.isArchived ? 'outline' : 'default'}>{row.original.isArchived ? t('status.archived') : t('status.active')}</Badge>,
      size: 120,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ActionCell
          row={row}
          onDelete={console.log}
          updateLink={{
            pathname: '/admin/[tenantId]/links-and-documents/links/[slug]/edit',
            params: { tenantId, slug: row.original.id },
          }}
        />
      ),
      size: 40,
    },
  ];

  const card = ({ row }: { row: Row<LinkWithRelations> }) => (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow flex-1">
      <CardHeader className="pb-2 flex-grow">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg font-semibold">{row.original.name || t('unnamed')}</CardTitle>
            <CardDescription className="mt-1">{row.original.document?.name || row.original.dataroom?.name || 'N/A'}</CardDescription>
          </div>
          <ActionCell
            row={row}
            onDelete={console.log}
            updateLink={{
              pathname: '/admin/[tenantId]/links-and-documents/links/[slug]/edit',
              params: { tenantId, slug: row.original.id },
            }}
          />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-grow">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <StatBadge label={t('table.views')} value={row.original._count.views} />
          <StatBadge label={t('table.status')} value={row.original.isArchived ? t('status.archived') : t('status.active')} />
          {row.original.expiresAt && <StatBadge label={t('table.expires')} value={formatDate(row.original.expiresAt)} />}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {row.original.password && <Badge variant="outline">{t('security.password')}</Badge>}
          {row.original.emailProtected && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> {t('security.emailProtected')}
            </Badge>
          )}
          {row.original.agreement && <Badge variant="outline">{t('security.agreement')}</Badge>}
        </div>
      </CardContent>
    </Card>
  );

  return { columns, card };
}

const StatBadge = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <Badge variant="outline" className="font-medium">
      {value}
    </Badge>
  </div>
);
