import type { ReactNode } from 'react';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { auth } from '@/server/auth-server';
import { Pencil } from 'lucide-react';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ApiKeyTesterCard } from '@/components/common/setting/api-key-tester-card';

interface ApiKeyDetailPageProps {
  params: Promise<{ locale: Locale; tenantId: string; keyId: string }>;
}

export async function generateMetadata({ params }: ApiKeyDetailPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: `${t('pages.apiKeysDetail.title')} - ${t('brandName')}`,
    description: t('pages.apiKeysDetail.description'),
  };
}

const ApiKeyDetailPage = async ({ params }: ApiKeyDetailPageProps) => {
  const { tenantId, keyId } = await params;
  const headersList = await headers();
  const t = await getTranslations('admin.setting.apiKeys');

  let apiKey: Awaited<ReturnType<typeof auth.api.getApiKey>>;

  try {
    apiKey = await auth.api.getApiKey({
      query: {
        id: keyId,
      },
      headers: headersList,
    });
  } catch (error) {
    notFound();
  }

  if (!apiKey) {
    notFound();
  }

  const metadataValue = normalizeMetadata(apiKey.metadata);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <Link href={{ pathname: '/admin/[tenantId]/settings/security/api-keys', params: { tenantId } }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {t('detail.backLink')}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{apiKey.name ?? t('detail.title')}</h1>
            <p className="text-muted-foreground">{t('detail.subtitle')}</p>
          </div>
          <Link
            href={{
              pathname: '/admin/[tenantId]/settings/security/api-keys/[keyId]/edit',
              params: { tenantId, keyId },
            }}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              {t('actions.edit')}
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.summary.title')}</CardTitle>
          <CardDescription>{t('detail.summary.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <DetailField label={t('detail.summary.prefix')} value={apiKey.prefix ?? t('detail.summary.notSet')} />
          <DetailField label={t('detail.summary.createdAt')} value={formatDate(apiKey.createdAt)} />
          <DetailField label={t('detail.summary.expiresAt')} value={apiKey.expiresAt ? formatDate(apiKey.expiresAt) : t('table.never')} />
          <DetailField label={t('detail.summary.lastRequest')} value={apiKey.lastRequest ? formatDate(apiKey.lastRequest) : t('table.never')} />
          <DetailField label={t('detail.summary.remaining')} value={typeof apiKey.remaining === 'number' ? apiKey.remaining.toLocaleString() : t('table.unlimited')} />
          <DetailField
            label={t('detail.summary.rateLimit')}
            value={
              apiKey.rateLimitEnabled
                ? t('detail.summary.rateLimitEnabled', {
                    max: apiKey.rateLimitMax ?? t('detail.summary.notSet'),
                    window: apiKey.rateLimitTimeWindow ?? t('detail.summary.notSet'),
                  })
                : t('detail.summary.rateLimitDisabled')
            }
          />
          <DetailField label={t('detail.summary.status')} value={<Badge variant={apiKey.enabled ? 'default' : 'secondary'}>{apiKey.enabled ? t('status.active') : t('status.inactive')}</Badge>} />
          <DetailField label={t('detail.summary.identifier')} value={<code className="text-xs">{apiKey.id}</code>} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.metadata.title')}</CardTitle>
          <CardDescription>{t('detail.metadata.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {metadataValue !== null ? (
            <pre className="text-xs font-mono whitespace-pre-wrap break-all bg-muted/40 border rounded-md p-4">{metadataValue}</pre>
          ) : (
            <p className="text-sm text-muted-foreground">{t('detail.metadata.empty')}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.apiUsage.title')}</CardTitle>
          <CardDescription>{t('detail.apiUsage.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">API Key Management</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">POST /api-key/verify</Badge>
              <Badge variant="outline">GET /api-key/get</Badge>
              <Badge variant="outline">DELETE /api-key/delete</Badge>
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-semibold mb-2">Forms API</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">GET /api/forms?tenantId=xxx</Badge>
              <Badge variant="outline">GET /api/forms/[id]?tenantId=xxx</Badge>
              <Badge variant="outline">GET /api/forms/[id]/submissions?tenantId=xxx</Badge>
              <Badge variant="outline">GET /api/submissions/[id]?tenantId=xxx</Badge>
              <Badge variant="outline">GET /api/menu-items?tenantId=xxx</Badge>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('detail.apiUsage.instructions')}</p>
            <p className="text-xs text-muted-foreground">
              <strong>Authentication:</strong> You can use either:
            </p>
            <ul className="text-xs text-muted-foreground list-disc list-inside ml-2 space-y-1">
              <li>
                API Key: <code className="bg-muted px-1 py-0.5 rounded">Authorization: Bearer YOUR_API_KEY</code>
              </li>
              <li>
                JWT Token: <code className="bg-muted px-1 py-0.5 rounded">Authorization: Bearer YOUR_JWT_TOKEN</code>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              <strong>Getting JWT Token:</strong> Call <code className="bg-muted px-1 py-0.5 rounded">GET /api/auth/token</code> with your session to get a JWT token.
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Tenant ID:</strong> All form-related endpoints require a <code className="bg-muted px-1 py-0.5 rounded">tenantId</code> query parameter.
            </p>
          </div>
        </CardContent>
      </Card>

      <ApiKeyTesterCard />
    </div>
  );
};

export default ApiKeyDetailPage;

const DetailField = ({ label, value }: { label: string; value: ReactNode }) => {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
};

const normalizeMetadata = (metadata: unknown) => {
  if (!metadata) return null;
  if (typeof metadata === 'string') {
    return metadata;
  }

  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return null;
  }
};
