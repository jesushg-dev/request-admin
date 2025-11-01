'use client';

import React, { useMemo, useTransition } from 'react';
import { authClient, useSession } from '@/server/auth-client';
import { useCountSession, useFindManySession } from '@/services/api/hooks';
import { Prisma } from '@zenstackhq/runtime/models';
import { ColumnDef } from '@tanstack/react-table';
import { Computer, Smartphone, Trash2 } from 'lucide-react';
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
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';
import { Hint } from '@/components/hint';

const SessionDefaultArgs = Prisma.validator<Prisma.SessionDefaultArgs>()({
  select: {
    id: true,
    token: true,
    expiresAt: true,
    createdAt: true,
    updatedAt: true,
    ipAddress: true,
    userAgent: true,
    userId: true,
    activeTenantId: true,
    impersonatedBy: true,
  },
});

type Session = Prisma.SessionGetPayload<typeof SessionDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Session>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<Session>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

export default function SessionManagementForm() {
  const session = useSession();
  const t = useTranslations('admin.setting.sessions');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<Session, Prisma.SessionFindManyArgs, Prisma.SessionCountArgs>({
    search,
    useFindManyHook: useFindManySession,
    useCountHook: useCountSession,
    defaultArgs: {
      ...SessionDefaultArgs,
      where: {
        userId: session?.data?.user?.id,
      },
    },
  });

  const [pending, startTransition] = useTransition();

  const { columns } = useMemo(() => getTableConfiguration({ t }), [t]);

  const { table } = useDataTable({
    data: data || [],
    columns,
    pageCount,
    enableRowSelection: false,
  });

  const revokeOtherSessions = () => {
    startTransition(async () => {
      const toastId = toast.loading(t('revokeLoading'));
      await authClient.revokeOtherSessions(
        {},
        {
          onSuccess: () => {
            refetch();
            toast.success(t('revokeSuccess'), { id: toastId });
          },
          onError: ({ error }) => {
            toast.error(t('revokeError', { error: error.message ?? 'N/A' }), { id: toastId });
          },
        }
      );
    });
  };

  if (isError && error) return <ErrorRetryFallback error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* Sessions Table */}
      <Card>
        <DataTableShell table={table}>
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyState={{
              title: t('table.empty'),
              description: t('description'),
            }}>
            <DataTableToolbarActions table={table} entityLabel={t('entityLabel')} exportFilename="sessions">
              <Button variant="ghost" onClick={revokeOtherSessions} disabled={pending} size="sm" className="text-destructive hover:text-destructive" aria-label={t('actions.revoke')}>
                <Trash2 className="h-4 w-4" /> Revoke other sessions
              </Button>
            </DataTableToolbarActions>
          </DataTable>
        </DataTableShell>
      </Card>

      {/* Session Security */}
      <Card>
        <CardHeader>
          <CardTitle>{t('security.title')}</CardTitle>
          <CardDescription>{t('security.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">{t('security.duration')}</h3>
            <p className="text-sm text-muted-foreground">{t('security.durationDescription')}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">{t('security.refresh')}</h3>
            <p className="text-sm text-muted-foreground">{t('security.refreshDescription')}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">{t('security.freshness')}</h3>
            <p className="text-sm text-muted-foreground">{t('security.freshnessDescription')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface GetTableConfigurationProps {
  t: ReturnType<typeof useTranslations>;
}

function getTableConfiguration({ t }: GetTableConfigurationProps) {
  const columns: ColumnDef<Session>[] = [
    {
      accessorKey: 'device',
      header: t('table.device'),
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {row.original.userAgent && (
            <>
              {/mobile/i.test(row.original.userAgent ?? '') ? <Smartphone className="h-4 w-4 text-muted-foreground" /> : <Computer className="h-4 w-4 text-muted-foreground" />}

              <Hint label={row.original.userAgent}>
                <span>{row.original.userAgent.length > 20 ? row.original.userAgent.slice(0, 20) + '...' : row.original.userAgent}</span>
              </Hint>
            </>
          )}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: 'ipAddress',
      header: t('table.ipAddress'),
      size: 120,
    },
    {
      accessorKey: 'updatedAt',
      header: t('table.lastActive'),
      cell: ({ row }) => formatDate(row.original.updatedAt),
      size: 120,
    },
    {
      accessorKey: 'expiresAt',
      header: t('table.expires'),
      cell: ({ row }) => formatDate(row.original.expiresAt),
      size: 120,
    },
    {
      accessorKey: 'status',
      header: t('table.status'),
      cell: ({ row }) =>
        row.original.id === row.original.activeTenantId ? <Badge className="bg-green-600 hover:bg-green-700">{t('status.current')}</Badge> : <Badge variant="outline">{t('status.active')}</Badge>,
      size: 100,
    },
    {
      id: 'actions',
      cell: ({ row }) => <ActionTableCell row={row} />,
      size: 100,
    },
  ];

  return { columns };
}

const ActionTableCell: React.FC<{ row: { original: Session } }> = ({ row }) => {
  const message = useMessage();
  const [pending, startTransition] = useTransition();
  const t = useTranslations('admin.setting.sessions');
  const currentSessionId = useSession().data?.session?.id;

  const revokeSession = async (sessionId: string) => {
    if (sessionId === currentSessionId) return;

    const confirmRevoke = await message.confirm(t('revokeDialog.description'), {
      title: t('revokeDialog.title'),
      confirmText: t('revokeDialog.confirm'),
      cancelText: t('revokeDialog.cancel'),
    });

    if (!confirmRevoke) return;

    startTransition(async () => {
      const toastId = toast.loading(t('revokeLoading'));
      await authClient.revokeSession(
        { token: row.original.token },
        {
          onSuccess: () => {
            toast.success(t('revokeSuccess'), { id: toastId });
          },
          onError: ({ error }) => {
            toast.error(t('revokeError', { error: error.message ?? 'N/A' }), { id: toastId });
          },
        }
      );
    });
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      {row.original.id !== currentSessionId && (
        <Button variant="ghost" onClick={() => revokeSession(row.original.id)} disabled={pending} size="icon" className="text-destructive hover:text-destructive" aria-label={t('actions.revoke')}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
ActionTableCell.displayName = 'ActionTableCell';
