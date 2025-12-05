'use client';

import React, { useMemo } from 'react';
import { useCountAgreement, useFindManyAgreement } from '@/services/api/hooks';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Prisma } from '@zenstackhq/runtime/models';
import { FileText, LinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { ActionCell } from '@/components/data-table/data-table-action-menu';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';
import { Hint } from '@/components/hint';
import { useTenantContext } from '@/components/hoc/tenant-provider';
import { TruncatedText } from '@/components/shared/table-util';

const AgreementDefaultArgs = Prisma.validator<Prisma.AgreementDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    content: true,
    requireName: true,
    createdAt: true,
    updatedAt: true,
    tenantId: true,
    _count: { select: { links: true, responses: true } },
  },
});

type AgreementWithRelations = Prisma.AgreementGetPayload<typeof AgreementDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<AgreementWithRelations>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<AgreementWithRelations>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

interface AgreementsPageClientProps {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export default function AgreementsPageClient({ canCreate, canEdit, canDelete }: AgreementsPageClientProps) {
  const { tenantId } = useTenantContext();
  const t = useTranslations('admin.agreement');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<AgreementWithRelations, Prisma.AgreementFindManyArgs, Prisma.AgreementCountArgs>({
    search,
    useFindManyHook: useFindManyAgreement,
    useCountHook: useCountAgreement,
    defaultArgs: {
      ...AgreementDefaultArgs,
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
          exportFilename="agreements"
          addLink={
            canCreate
              ? {
                  pathname: '/admin/[tenantId]/links-and-documents/agreements/new',
                  params: { tenantId },
                }
              : undefined
          }
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
  const columns: ColumnDef<AgreementWithRelations>[] = [
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
      accessorKey: 'description',
      header: t('table.description'),
      cell: ({ row }) => (
        <Hint label={row.original.description ?? ''}>
          <TruncatedText text={row.original.description || ''} maxLength={30} />
        </Hint>
      ),
      size: 200,
    },
    {
      accessorKey: 'contentPreview',
      header: t('table.content'),
      cell: ({ row }) => (
        <Hint label={row.original.content ?? ''}>
          <TruncatedText text={row.original.content || ''} maxLength={30} />
        </Hint>
      ),
      size: 200,
    },
    {
      accessorKey: 'links',
      header: t('table.links'),
      cell: ({ row }) => row.original._count.links,
      size: 120,
    },
    {
      accessorKey: 'responses',
      header: t('table.responses'),
      cell: ({ row }) => row.original._count.responses,
      size: 120,
    },
    {
      accessorKey: 'requireName',
      header: t('table.requireName'),
      cell: ({ row }) => <Badge variant={row.original.requireName ? 'default' : 'outline'}>{row.original.requireName ? t('status.required') : t('status.notRequired')}</Badge>,
      size: 120,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ActionCell
          row={row}
          onDelete={canDelete ? () => console.log('Delete', row.original.id) : undefined}
          updateLink={
            canEdit
              ? {
                  pathname: '/admin/[tenantId]/links-and-documents/agreements/[slug]/edit',
                  params: { tenantId, slug: row.original.id },
                }
              : undefined
          }
        />
      ),
      size: 20,
    },
  ];

  const card = ({ row }: { row: Row<AgreementWithRelations> }) => (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow flex-1">
      <CardHeader className="pb-2 flex-grow">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg font-semibold">{row.original.name}</CardTitle>
            <CardDescription className="mt-1">{formatDate(row.original.createdAt)}</CardDescription>
          </div>
          <ActionCell
            row={row}
            onDelete={canDelete ? () => console.log('Delete', row.original.id) : undefined}
            updateLink={
              canEdit
                ? {
                    pathname: '/admin/[tenantId]/links-and-documents/agreements/[slug]/edit',
                    params: { tenantId, slug: row.original.id },
                  }
                : undefined
            }
          />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-grow">
        <div className="space-y-2">
          {row.original.description && <TruncatedText text={row.original.description} maxLength={30} />}
          <div className="border rounded-md p-3 bg-muted/50 mb-4 h-32 overflow-auto">
            <p className="text-sm text-muted-foreground">{row.original.content || t('noContent')}</p>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t">
          <div className="flex flex-wrap gap-3 items-center text-sm">
            <Badge variant="outline" className="gap-1">
              <LinkIcon className="h-4 w-4" />
              {row.original._count.links} {t('table.links')}
            </Badge>

            <Badge variant="outline" className="gap-1">
              <FileText className="h-4 w-4" />
              {row.original._count.responses} {t('table.responses')}
            </Badge>

            <Badge variant={row.original.requireName ? 'default' : 'outline'}>{row.original.requireName ? t('status.required') : t('status.notRequired')}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return { columns, card };
}
