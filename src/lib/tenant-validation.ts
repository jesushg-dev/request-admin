import { getActiveTenantId } from '@/server/auth-server';
import { validateTenantId } from './tenant';
import { requireUser } from '@/server/auth-server';

/**
 * Validates that the provided tenantId matches the active tenant in the session
 * and that the user has access to it.
 * 
 * This is an optional validation that can be used in critical actions to ensure
 * that the tenantId being used matches the active organization in the session.
 * 
 * @param tenantId - The tenant ID to validate
 * @returns true if the tenantId matches the active tenant and user has access, false otherwise
 * 
 * @example
 * ```ts
 * export async function criticalAction(tenantId: string, data: any) {
 *   const isValid = await validateTenantAccess(tenantId);
 *   if (!isValid) {
 *     throw new Error('Invalid tenant access');
 *   }
 *   // Proceed with action...
 * }
 * ```
 */
export async function validateTenantAccess(tenantId: string): Promise<boolean> {
  try {
    const user = await requireUser();
    const activeTenantId = await getActiveTenantId();
    
    // If there's an active tenant in the session, it must match the provided tenantId
    if (activeTenantId && activeTenantId !== tenantId) {
      return false;
    }
    
    // Validate that the user has access to the tenant
    return await validateTenantId(tenantId, user.id);
  } catch (error) {
    console.error('Error validating tenant access:', error);
    return false;
  }
}

