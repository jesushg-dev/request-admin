'use client';

import { useEffect, useState, useTransition } from 'react';
import { verifyApiKeyAction } from '@/actions/api-key';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ApiKeyTesterCardProps {
  defaultKey?: string;
}

export const ApiKeyTesterCard: React.FC<ApiKeyTesterCardProps> = ({ defaultKey }) => {
  const t = useTranslations('admin.setting.apiKeys');
  const [apiKeyInput, setApiKeyInput] = useState(defaultKey ?? '');
  const [permissionsInput, setPermissionsInput] = useState('');
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultKey) {
      setApiKeyInput(defaultKey);
    }
  }, [defaultKey]);

  const handleTest = () => {
    setLocalError(null);
    setResult(null);

    if (!apiKeyInput.trim()) {
      setLocalError(t('tester.missingKey'));
      return;
    }

    let permissions: Record<string, string[]> | undefined;

    if (permissionsInput.trim()) {
      try {
        permissions = JSON.parse(permissionsInput);
      } catch (error) {
        setLocalError(t('tester.invalidPermissions'));
        return;
      }
    }

    startTransition(async () => {
      try {
        const verification = await verifyApiKeyAction({
          key: apiKeyInput.trim(),
          permissions,
        });

        setResult(verification as unknown as Record<string, unknown>);
        toast.success((verification as { valid?: boolean }).valid ? t('tester.success') : t('tester.invalid'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'N/A';
        setLocalError(message);
        toast.error(t('tester.error', { error: message }));
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('tester.title')}</CardTitle>
        <CardDescription>{t('tester.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="api-key-input">
            {t('tester.apiKeyLabel')}
          </label>
          <Input id="api-key-input" placeholder={t('tester.apiKeyPlaceholder')} value={apiKeyInput} onChange={(event) => setApiKeyInput(event.target.value)} disabled={pending} />
          <p className="text-xs text-muted-foreground">{t('tester.apiKeyHint')}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="permissions-input">
            {t('tester.permissionsLabel')}
          </label>
          <Textarea
            id="permissions-input"
            placeholder={t('tester.permissionsPlaceholder')}
            value={permissionsInput}
            onChange={(event) => setPermissionsInput(event.target.value)}
            className="font-mono"
            disabled={pending}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">{t('tester.permissionsHint')}</p>
        </div>

        {localError ? <p className="text-sm text-destructive">{localError}</p> : null}

        <div className="flex items-center gap-3">
          <Button onClick={handleTest} disabled={pending}>
            {pending ? t('tester.testing') : t('tester.testButton')}
          </Button>
          <code className="text-muted-foreground text-xs">{t('tester.endpoint')}</code>
        </div>

        {result ? (
          <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge variant={(result as { valid?: boolean }).valid ? 'default' : 'destructive'}>{(result as { valid?: boolean }).valid ? t('tester.valid') : t('tester.invalid')}</Badge>
              {'error' in result && result.error ? <span className="text-sm text-muted-foreground">{String((result as { error?: { message?: string } }).error?.message)}</span> : null}
            </div>
            <pre className="text-xs font-mono whitespace-pre-wrap break-all bg-background border rounded-md p-3 max-h-64 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
