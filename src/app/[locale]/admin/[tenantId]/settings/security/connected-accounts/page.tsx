'use client';

import React, { useMemo, useTransition } from 'react';
import { authClient, useSession } from '@/server/auth-client';
import { useCountAccount, useFindManyAccount } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { AlertCircle, Facebook, Github, ChromeIcon as Google, Link, Linkedin, Mail, Trash2, Twitter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';
import { toast } from 'sonner';

import useMessage from '@/lib/message';
import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

export const AccountDefaultArgs = Prisma.validator<Prisma.AccountDefaultArgs>()({
  select: {
    id: true,
    providerId: true,
    accountId: true,
    createdAt: true,
    updatedAt: true,
    accessTokenExpiresAt: true,
    refreshTokenExpiresAt: true,
  },
});

type Account = Prisma.AccountGetPayload<typeof AccountDefaultArgs>;

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Account>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<Account>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

const availableProviders = [
  { id: 'google', name: 'Google', icon: Google, color: '#4285F4' },
  { id: 'github', name: 'GitHub', icon: Github, color: '#333' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
] as const;

export default function AccountManagementForm() {
  const session = useSession();
  const t = useTranslations('admin.setting.accounts');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<Account, Prisma.AccountFindManyArgs, Prisma.AccountCountArgs>({
    search,
    useFindManyHook: useFindManyAccount,
    useCountHook: useCountAccount,
    defaultArgs: {
      ...AccountDefaultArgs,
      where: {
        userId: session?.data?.user?.id,
      },
    },
  });

  const { columns } = useMemo(() => getTableConfiguration({ t }), [t]);

  const { table } = useDataTable({
    data: data || [],
    columns,
    pageCount,
    enableRowSelection: false,
  });

  if (isError && error) return <ErrorRetryFallback error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6 w-full">
      <Card>
        <DataTableShell table={table}>
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyState={{
              title: t('table.empty'),
              description: t('description'),
            }}>
            <DataTableToolbarActions table={table} entityLabel={t('entityLabel')} exportFilename="accounts" />
          </DataTable>
        </DataTableShell>
      </Card>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('security.title')}</AlertTitle>
        <AlertDescription>{t('security.description')}</AlertDescription>
      </Alert>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <CardTitle>{t('linkNew.title')}</CardTitle>
          <CardDescription>{t('linkNew.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableProviders.map((provider) => (
              <ProviderLinkButton key={provider.id} provider={provider} t={t} />
            ))}
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
  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: 'providerId',
      header: t('table.provider'),
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {renderProviderIcon(row.original.providerId)}
          <span className="capitalize">{row.original.providerId}</span>
        </div>
      ),
      size: 150,
    },
    {
      accessorKey: 'accountId',
      header: t('table.accountId'),
      size: 200,
    },
    {
      accessorKey: 'createdAt',
      header: t('table.connected'),
      cell: ({ row }) => formatDate(row.original.createdAt),
      size: 120,
    },
    {
      accessorKey: 'status',
      header: t('table.status'),
      cell: ({ row }) => <Badge variant={row.original.providerId === 'email' ? 'default' : 'outline'}>{row.original.providerId === 'email' ? t('status.primary') : t('status.connected')}</Badge>,
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

const ActionTableCell: React.FC<{ row: { original: Account } }> = ({ row }) => {
  const message = useMessage();
  const [pending, startTransition] = useTransition();
  const t = useTranslations('admin.setting.accounts');

  const handleUnlink = async (providerId: string, accountId: string) => {
    if (row.original.providerId === 'email') return;

    const confirm = await message.confirm(t('unlinkDialog.description'), {
      title: t('unlinkDialog.title'),
      confirmText: t('unlinkDialog.confirm'),
      cancelText: t('unlinkDialog.cancel'),
    });

    if (!confirm) return;

    startTransition(async () => {
      const toastId = toast.loading(t('unlinkLoading'));
      await authClient.unlinkAccount(
        { providerId, accountId },
        {
          onSuccess: () => {
            toast.success(t('unlinkSuccess'), { id: toastId });
          },
          onError: ({ error }) => {
            toast.error(t('unlinkError', { error: error.message }), { id: toastId });
          },
        }
      );
    });
  };

  return (
    <div className="flex items-center justify-end">
      {row.original.providerId !== 'email' && (
        <Button variant="ghost" size="sm" onClick={() => handleUnlink(row.original.providerId, row.original.accountId)} disabled={pending} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          {t('actions.unlink')}
        </Button>
      )}
    </div>
  );
};

const ProviderLinkButton = ({ provider, t }: { provider: (typeof availableProviders)[number]; t: ReturnType<typeof useTranslations> }) => {
  const [pending, startTransition] = useTransition();

  const handleLink = () => {
    startTransition(async () => {
      const toastId = toast.loading(t('linkLoading', { provider: provider.name }));
      await authClient.linkSocial(
        { provider: provider.id },
        {
          onSuccess: () => {
            toast.success(t('linkSuccess', { provider: provider.name }), { id: toastId });
          },
          onError: ({ error }) => {
            toast.error(t('linkError', { provider: provider.name, error: error.message }), { id: toastId });
          },
        }
      );
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-md">
      <div className="flex items-center space-x-3">
        <provider.icon className="h-6 w-6" style={{ color: provider.color }} />
        <div>
          <h3 className="font-medium">{provider.name}</h3>
          <p className="text-sm text-muted-foreground">{t('linkNew.providerDescription', { provider: provider.name })}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={handleLink} disabled={pending}>
        <Link className="h-4 w-4 mr-2" />
        {t('actions.link')}
      </Button>
    </div>
  );
};

// Helper function para íconos
const renderProviderIcon = (providerId: string) => {
  switch (providerId) {
    case 'google':
      return <Google className="h-4 w-4" />;
    case 'github':
      return <Github className="h-4 w-4" />;
    case 'email':
      return <Mail className="h-4 w-4" />;
    default:
      return <Mail className="h-4 w-4" />;
  }
};
