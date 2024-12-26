'use server';

import { UNSTABLE_TENANT_ID } from '@/lib/constant';

export const getCurrentTenantId = async () => {
  return UNSTABLE_TENANT_ID;
};

export async function changeTenantAction(data: FormData) {
  const tenantId = data.get('tenantId') as string | null;
  if (!tenantId) throw new Error('Tenant ID is required.');
}
