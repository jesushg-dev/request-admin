'use client';

import React, { useMemo } from 'react';
import { useCountDataroom, useFindManyDataroom } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { ColumnDef, Row } from '@tanstack/react-table';
import { EyeIcon, FileIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import useTenantId from '@/hooks/use-tenant-id';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';
import { Hint } from '@/components/hint';

const DataroomDefaultArgs = Prisma.validator<Prisma.DataroomDefaultArgs>()({
  select: {
    id: true,
    pId: true,
    name: true,
    createdAt: true,
    _count: {
      select: {
        documents: true,
        viewers: true,
        links: true,
        views: true,
      },
    },
  },
});

type DataroomWithRelations = Prisma.DataroomGetPayload<typeof DataroomDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<DataroomWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<DataroomWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

interface DataRoomsPageClientProps {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export default function DataRoomsPageClient({ canCreate, canEdit, canDelete }: DataRoomsPageClientProps) {
  const tenantId = useTenantId();
  const t = useTranslations('admin.dataroom.main');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<DataroomWithRelations, Prisma.DataroomFindManyArgs, Prisma.DataroomCountArgs>({
    search,
    useFindManyHook: useFindManyDataroom,
    useCountHook: useCountDataroom,
    defaultArgs: {
      ...DataroomDefaultArgs,
      where: { tenantId },
    },
  });

  const { columns, card } = useMemo(() => getTableConfiguration({ t, tenantId, canEdit, canDelete }), [t, tenantId, canEdit, canDelete]);

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
          exportFilename="datarooms"
          addLink={canCreate ? {
            pathname: '/admin/[tenantId]/links-and-documents/data-rooms/new',
            params: { tenantId },
          } : undefined}
        />
      </DataTable>
    </DataTableShell>
  );
}

interface TableConfigProps {
  t: ReturnType<typeof useTranslations>;
  tenantId: string;
  canEdit: boolean;
  canDelete: boolean;
}

function getTableConfiguration({ t, tenantId, canEdit, canDelete }: TableConfigProps) {
  const columns: ColumnDef<DataroomWithRelations>[] = [
    {
      accessorKey: 'name',
      header: t('table.name'),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.name}
          <div className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</div>
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: 'pId',
      header: t('table.slug'),
      cell: ({ row }) => (
        <Hint label={row.original.pId}>
          <span className="text-sm text-muted-foreground">{row.original.pId}</span>
        </Hint>
      ),
      size: 120,
    },
    {
      accessorKey: 'documents',
      header: t('table.documents'),
      cell: ({ row }) => row.original._count.documents,
      size: 120,
    },
    {
      accessorKey: 'viewers',
      header: t('table.viewers'),
      cell: ({ row }) => row.original._count.viewers,
      size: 120,
    },
    {
      accessorKey: 'links',
      header: t('table.links'),
      cell: ({ row }) => row.original._count.links,
      size: 120,
    },
    {
      accessorKey: 'views',
      header: t('table.views'),
      cell: ({ row }) => row.original._count.views,
      size: 120,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ActionCell
          row={row}
          onDelete={canDelete ? console.log : undefined}
          updateLink={canEdit ? {
            pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/edit',
            params: { tenantId, slug: row.original.id },
          } : undefined}
          viewLink={{
            pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]',
            params: { tenantId, slug: row.original.id },
          }}
        />
      ),
      size: 40,
    },
  ];

  const card = ({ row }: { row: Row<DataroomWithRelations> }) => (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow flex-1">
      <CardHeader className="pb-2 flex-grow">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg font-semibold">{row.original.name}</CardTitle>
            <CardDescription className="mt-1">{formatDate(row.original.createdAt)}</CardDescription>
          </div>
          <ActionCell
            row={row}
            onDelete={canDelete ? console.log : undefined}
            updateLink={canEdit ? {
              pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/edit',
              params: { tenantId, slug: row.original.id },
            } : undefined}
            viewLink={{
              pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]',
              params: { tenantId, slug: row.original.id },
            }}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center">
              <FileIcon className="w-3 h-3 mr-2" />
              {t('table.documents')}:
            </span>
            <span className="font-medium">{row.original._count.documents}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center">
              <EyeIcon className="w-3 h-3 mr-2" />
              {t('table.views')}:
            </span>
            <span className="font-medium">{row.original._count.views}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return { columns, card };
}

