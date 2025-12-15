'use client';

import React, { useMemo, useTransition } from 'react';
import { Link } from '@/i18n/routing';
import { authClient, useSession } from '@/server/auth-client';
import { useCountApikey, useFindManyApikey } from '@/services/api/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Prisma } from '@zenstackhq/runtime/models';
import { Eye, RefreshCw, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';
import { toast } from 'sonner';

import useMessage from '@/lib/message';
import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { ApiKeyTesterCard } from '@/components/common/setting/api-key-tester-card';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';
import { useTenantContext } from '@/components/hoc/tenant-provider';

const ApiKeyDefaultArgs = Prisma.validator<Prisma.ApikeyDefaultArgs>()({
  select: {
    id: true,
    name: true,
    prefix: true,
    key: true,
    createdAt: true,
    expiresAt: true,
    lastRequest: true,
    enabled: true,
    metadata: true,
    remaining: true,
    rateLimitEnabled: true,
    rateLimitMax: true,
    rateLimitTimeWindow: true,
  },
});

type ApiKey = Prisma.ApikeyGetPayload<typeof ApiKeyDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<ApiKey>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<ApiKey>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

export default function ApiKeyManagementForm() {
  const session = useSession();
  const { tenantId } = useTenantContext();
  const t = useTranslations('admin.setting.apiKeys');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<ApiKey, Prisma.ApikeyFindManyArgs, Prisma.ApikeyCountArgs>({
    search,
    useFindManyHook: useFindManyApikey,
    useCountHook: useCountApikey,
    defaultArgs: {
      ...ApiKeyDefaultArgs,
      where: {
        userId: session?.data?.user?.id,
      },
    },
  });

  const { columns } = useMemo(() => getTableConfiguration({ t, tenantId, onChange: refetch }), [t, tenantId, refetch]);

  const { table } = useDataTable({
    data: data || [],
    columns,
    pageCount,
    enableRowSelection: false,
  });

  if (isError && error) return <ErrorRetryFallback error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* API Keys Table */}
      <Card>
        <DataTableShell table={table}>
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyState={{
              title: t('table.empty'),
              description: t('description'),
            }}>
            <DataTableToolbarActions
              table={table}
              entityLabel={t('entityLabel')}
              exportFilename="api-keys"
              addLink={{
                pathname: '/admin/[tenantId]/settings/security/api-keys/new',
                params: { tenantId },
              }}
            />
          </DataTable>
        </DataTableShell>
      </Card>

      {/* Usage Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>{t('usage.title')}</CardTitle>
          <CardDescription>{t('usage.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">{t('usage.authentication')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('usage.authDescription')}</p>
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold block p-4 overflow-x-auto">{t('usage.authExample')}</code>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">{t('usage.rateLimiting')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('usage.rateLimitDescription')}</p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              <span>{t('usage.rateLimitNote')}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">{t('usage.security')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('usage.securityDescription')}</p>
          </div>
        </CardContent>
      </Card>

      <ApiKeyTesterCard />
    </div>
  );
}

interface GetTableConfigurationProps {
  t: ReturnType<typeof useTranslations>;
  tenantId: string;
  onChange?: () => void;
}

function getTableConfiguration({ t, tenantId, onChange }: GetTableConfigurationProps) {
  const columns: ColumnDef<ApiKey>[] = [
    {
      accessorKey: 'name',
      header: t('table.name'),
      cell: ({ row }) => (
        <div>
          <Link href={{ pathname: '/admin/[tenantId]/settings/security/api-keys/[keyId]', params: { tenantId, keyId: row.original.id } }} className="font-medium hover:underline">
            {row.original.name}
          </Link>
          <div className="text-xs text-muted-foreground">{row.original.prefix}_***</div>
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: 'createdAt',
      header: t('table.created'),
      cell: ({ row }) => formatDate(row.original.createdAt),
      size: 120,
    },
    {
      accessorKey: 'expiresAt',
      header: t('table.expires'),
      cell: ({ row }) => (row.original.expiresAt ? formatDate(row.original.expiresAt) : <span className="text-muted-foreground">{t('table.never')}</span>),
      size: 120,
    },
    {
      accessorKey: 'lastRequest',
      header: t('table.lastRequest'),
      cell: ({ row }) => (row.original.lastRequest ? formatDate(row.original.lastRequest) : <span className="text-muted-foreground">{t('table.never')}</span>),
      size: 120,
    },
    {
      accessorKey: 'remaining',
      header: t('table.remaining'),
      cell: ({ row }) => (typeof row.original.remaining === 'number' ? row.original.remaining.toLocaleString() : <span className="text-muted-foreground">{t('table.unlimited')}</span>),
      size: 120,
    },
    {
      accessorKey: 'rateLimitEnabled',
      header: t('table.rateLimit'),
      cell: ({ row }) =>
        row.original.rateLimitEnabled ? (
          <div>
            <div className="font-medium">{t('table.rateLimitSummary', { max: (row.original.rateLimitMax ?? 0).toLocaleString() })}</div>
            <div className="text-xs text-muted-foreground">{t('table.rateLimitWindow', { window: (row.original.rateLimitTimeWindow ?? 0).toLocaleString() })}</div>
          </div>
        ) : (
          <span className="text-muted-foreground">{t('table.rateLimitDisabled')}</span>
        ),
      size: 170,
    },
    {
      accessorKey: 'enabled',
      header: t('table.status'),
      cell: ({ row }) => (row.original.enabled ? <Badge className="bg-green-600 hover:bg-green-700">{t('status.active')}</Badge> : <Badge variant="outline">{t('status.inactive')}</Badge>),
      size: 100,
    },
    {
      id: 'actions',
      cell: ({ row }) => <ActionTableCell row={row} tenantId={tenantId} onChange={onChange} />,
      size: 100,
    },
  ];

  return { columns };
}

const ActionTableCell: React.FC<{ row: { original: ApiKey }; tenantId: string; onChange?: () => void }> = ({ row, tenantId, onChange }) => {
  const message = useMessage();
  const [pending, startTransition] = useTransition();
  const t = useTranslations('admin.setting.apiKeys');

  const toggleStatus = (keyId: string, enabled: boolean) => {
    startTransition(async () => {
      const toastId = toast.loading(t('statusLoading'));
      await authClient.apiKey.update(
        { keyId, enabled },
        {
          onSuccess: () => {
            toast.success(t('statusSuccess', { status: enabled ? t('status.active') : t('status.inactive') }), { id: toastId });
            onChange?.();
          },
          onError: ({ error }: { error: Error }) => {
            toast.error(t('statusError', { error: error.message ?? 'N/A' }), { id: toastId });
          },
        }
      );
    });
  };

  const deleteKey = async (keyId: string) => {
    const confirmDelete = await message.confirm(t('deleteDialog.description'), {
      title: t('deleteDialog.title'),
      confirmText: t('deleteDialog.confirm'),
      cancelText: t('deleteDialog.cancel'),
    });

    if (!confirmDelete) return;

    startTransition(async () => {
      const toastId = toast.loading(t('deleteLoading'));
      await authClient.apiKey.delete(
        { keyId },
        {
          onSuccess: () => {
            toast.success(t('deleteSuccess'), { id: toastId });
            onChange?.();
          },
          onError: ({ error }: { error: Error }) => {
            toast.error(t('deleteError', { error: error.message ?? 'N/A' }), { id: toastId });
          },
        }
      );
    });
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      <Button asChild variant="ghost" size="icon" aria-label={t('actions.view')} disabled={pending}>
        <Link href={{ pathname: '/admin/[tenantId]/settings/security/api-keys/[keyId]', params: { tenantId, keyId: row.original.id } }}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Switch checked={row.original.enabled ?? false} disabled={pending} onCheckedChange={(checked) => toggleStatus(row.original.id, checked)} aria-label="Toggle API key status" />
      <Button variant="ghost" onClick={() => deleteKey(row.original.id)} disabled={pending} size="icon" className="text-destructive hover:text-destructive" aria-label={t('actions.delete')}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
ActionTableCell.displayName = 'ActionTableCell';
