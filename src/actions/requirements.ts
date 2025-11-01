'use server';

import { getDb } from '@/server/db-client';

export async function updateRequirementCompliance(requestId: string, tenantId: string, compliances: Record<string, boolean>) {
  const db = await getDb();
  try {
    await db.$transaction(async (tx) => {
      // Actualizar solo los requisitos existentes
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
