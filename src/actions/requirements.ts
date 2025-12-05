'use server';

import { getDb } from '@/server/db-client';

export async function updateRequirementCompliance(requestId: string, tenantId: string, compliances: Record<string, boolean>) {
  const db = await getDb();
  try {
    await db.$transaction(async (tx) => {
      // Update only existing requirements for this tenant
      const existingRequirements = await tx.requirement.findMany({
        where: { tenantId },
        select: { id: true },
      });

      for (const req of existingRequirements) {
        await tx.requirementComplianceTracking.upsert({
          where: { unique_compliance_tracking: { tenantId, requestId, requirementId: req.id } },
          update: { isFulfilled: compliances[req.id] },
          create: {
            tenantId,
            requestId,
            requirementId: req.id,
            isFulfilled: compliances[req.id],
          },
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Update failed:', error);
    return { error: 'Failed to update requirements' };
  }
}

/**
 * Check if all requirements for a request are fulfilled.
 * Only counts requirements that are not archived (isArchived = false).
 */
export async function areAllRequirementsFulfilled(requestId: string, tenantId: string): Promise<boolean> {
  const db = await getDb();

  // Fetch non-archived compliance tracking records
  const complianceTrackings = await db.requirementComplianceTracking.findMany({
    where: {
      requestId,
      tenantId,
      isArchived: false,
    },
    select: {
      isFulfilled: true,
    },
  });

  // If no requirements exist, treat as fulfilled
  if (complianceTrackings.length === 0) {
    return true;
  }

  // Ensure all are fulfilled
  return complianceTrackings.every((tracking) => tracking.isFulfilled);
}
