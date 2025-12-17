import { useTenantContext } from '@/components/hoc/tenant-provider';

/**
 * Hook to check upload storage configuration for the current tenant
 * Uses the tenant context instead of making additional queries
 * @param _featureKey - Deprecated, kept for backward compatibility
 * @param _tenantId - Deprecated, kept for backward compatibility
 * @returns Object with isEnabled boolean (true if using internal storage)
 */
export function useFeatureFlag(_featureKey: string, _tenantId?: string) {
  const { currentTenant } = useTenantContext();

  const isInternalUpload = currentTenant?.uploadStorageType === 'internal';

  return { isEnabled: isInternalUpload, isLoading: false };
}
