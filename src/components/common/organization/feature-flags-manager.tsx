'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdateTenant } from '@/services/api/hooks/tenant';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Select from '@/components/custom-ui/select';
import { useTenantContext } from '@/components/hoc/tenant-provider';

interface FeatureFlagsManagerProps {
  tenantId: string;
}

type UploadStorageType = 'uploadthing' | 'internal' | null;

export function FeatureFlagsManager({ tenantId }: FeatureFlagsManagerProps) {
  const t = useTranslations('tenants.organization.uploadConfig');
  const queryClient = useQueryClient();
  const router = useRouter();
  const { currentTenant } = useTenantContext();

  const updateTenant = useUpdateTenant();

  const selectedValue: UploadStorageType = (currentTenant?.uploadStorageType as UploadStorageType) || 'uploadthing';
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (value: string) => {
    const newValue = value === 'uploadthing' || value === 'internal' ? value : null;
    setIsUpdating(true);
    try {
      await updateTenant.mutateAsync({
        where: {
          id: tenantId,
        },
        data: {
          uploadStorageType: newValue || 'uploadthing',
        },
      });
      toast.success(t('toast.updated'));
      // Invalidate tenant queries to refresh the context
      queryClient.invalidateQueries({ queryKey: ['zenstack', 'Tenant', 'findMany'] });
      queryClient.invalidateQueries({ queryKey: ['zenstack', 'Tenant', 'findUnique'] });
      // Refresh server components to update tenant context
      router.refresh();
    } catch (error) {
      console.error('Error updating upload storage configuration:', error);
      toast.error(t('toast.error'));
    } finally {
      setIsUpdating(false);
    }
  };

  const options = [
    { label: t('options.uploadthing'), value: 'uploadthing' },
    { label: t('options.internal'), value: 'internal' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="upload-storage-type" className="text-base">
            {t('storageType.label')}
          </Label>
          <p className="text-sm text-muted-foreground">{t('storageType.description')}</p>
          {isUpdating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('loading')}</span>
            </div>
          ) : (
            <Select value={selectedValue} onValueChange={handleChange} options={options} disabled={isUpdating} placeholder={t('storageType.placeholder')} />
          )}
        </div>
        <Separator />
        <p className="text-xs text-muted-foreground">{t('note')}</p>
      </CardContent>
    </Card>
  );
}
