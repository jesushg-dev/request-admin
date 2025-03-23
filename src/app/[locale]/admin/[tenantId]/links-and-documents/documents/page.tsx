'use client';

import React, { useMemo } from 'react';
import { Link } from '@/i18n/routing';
import { useCountDocument, useFindManyDocument } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Download, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFileIcon } from '@/lib/document-utils';
import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import useTenantId from '@/hooks/use-tenant-id';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

export const DocumentDefaultArgs = Prisma.validator<Prisma.DocumentDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    type: true,
    contentType: true,
    numPages: true,
    createdAt: true,
    updatedAt: true,
    _count: {
      select: {
        links: true,
        views: true,
        versions: true,
        conversations: true,
      },
    },
  },
});

export type DocumentWithRelations = Prisma.DocumentGetPayload<typeof DocumentDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<DocumentWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<DocumentWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

export default function DocumentListPage() {
  const tenantId = useTenantId();
  const t = useTranslations('admin.document.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<DocumentWithRelations, Prisma.DocumentFindManyArgs, Prisma.DocumentCountArgs>({
    search,
    useFindManyHook: useFindManyDocument,
    useCountHook: useCountDocument,
    defaultArgs: {
      ...DocumentDefaultArgs,
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
        <DataTableToolbarActions
          table={table}
          entityLabel={t('entityLabel')}
          exportFilename="documents"
          addLink={{ pathname: '/admin/[tenantId]/links-and-documents/documents/upload', params: { tenantId } }}
        />
      </DataTable>
    </DataTableShell>
  );
}

interface TableConfigProps {
  t: ReturnType<typeof useTranslations>;
  tenantId: string;
}

function getTableConfiguration({ t, tenantId }: TableConfigProps) {
  const columns: ColumnDef<DocumentWithRelations>[] = [
    {
      accessorKey: 'name',
      header: t('table.name'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getFileIcon(row.original.type)}
          <div className="font-medium">
            {row.original.name}
            <div className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</div>
          </div>
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: 'type',
      header: t('table.type'),
      cell: ({ row }) => (
        <Badge variant="outline" className="uppercase">
          {row.original.type}
        </Badge>
      ),
      size: 120,
    },
    {
      accessorKey: 'numPages',
      header: t('table.pages'),
      cell: ({ row }) => row.original.numPages || 'N/A',
      size: 100,
    },
    {
      accessorKey: 'views',
      header: t('table.views'),
      cell: ({ row }) => row.original._count.views,
      size: 100,
    },
    {
      accessorKey: 'links',
      header: t('table.links'),
      cell: ({ row }) => row.original._count.links,
      size: 100,
    },
    {
      accessorKey: 'versions',
      header: t('table.versions'),
      cell: ({ row }) => row.original._count.versions,
      size: 100,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ActionCell
          row={row}
          onDelete={console.log}
          viewLink={{
            pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]',
            params: { tenantId, slug: row.original.id },
          }}
          updateLink={{
            pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]/edit',
            params: { tenantId, slug: row.original.id },
          }}>
          <DropdownMenuItem asChild>
            <Link
              href={{
                pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]',
                params: { tenantId, slug: row.original.id },
              }}
              className="flex gap-2">
              <Download className="h-4 w-4" />
              {t('actions.download')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={{
                pathname: '/admin/[tenantId]/links-and-documents/links/new',
                params: { tenantId },
              }}
              className="flex gap-2">
              <Share2 className="h-4 w-4" />
              {t('actions.share')}
            </Link>
          </DropdownMenuItem>
        </ActionCell>
      ),
      size: 40,
    },
  ];

  const card = ({ row }: { row: Row<DocumentWithRelations> }) => (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow flex-1">
      <CardHeader className="pb-2 flex-grow">
        <div className="flex justify-between items-start gap-2">
          {getFileIcon(row.original.type)}
          <div>
            <CardTitle className="text-lg font-semibold">{row.original.name}</CardTitle>
            <CardDescription className="mt-1">{formatDate(row.original.createdAt)}</CardDescription>
          </div>
          <ActionCell
            row={row}
            onDelete={console.log}
            viewLink={{
              pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]',
              params: { tenantId, slug: row.original.id },
            }}
            updateLink={{
              pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]/edit',
              params: { tenantId, slug: row.original.id },
            }}>
            <DropdownMenuItem asChild>
              <Link
                href={{
                  pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]',
                  params: { tenantId, slug: row.original.id },
                }}
                className="flex gap-2">
                <Download className="h-4 w-4" />
                {t('actions.download')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={{
                  pathname: '/admin/[tenantId]/links-and-documents/links/new',
                  params: { tenantId },
                }}
                className="flex gap-2">
                <Share2 className="h-4 w-4" />
                {t('actions.share')}
              </Link>
            </DropdownMenuItem>
          </ActionCell>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-grow">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <StatBadge label={t('table.type')} value={row.original.type || 'N/A'} />
          <StatBadge label={t('table.pages')} value={row.original.numPages || 'N/A'} />
          <StatBadge label={t('table.views')} value={row.original._count.views} />
          <StatBadge label={t('table.links')} value={row.original._count.links} />
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
