'use server';

import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';
import { TPlanFeatureSchema, TPlanInfoSchema } from '@/services/schemas/plan';

class UserNotFoundErr extends Error {}

export type CreatePlanInput = TPlanInfoSchema & TPlanFeatureSchema;

/**
 * Creates a new plan with its features
 * @param data Plan data including name, description, price, durationInDays, and features
 * @returns The created plan with its features
 */
export async function createPlanWithFeatures(data: CreatePlanInput) {
  const session = await currentSession();
  if (!session?.user.isGlobalAdmin) {
    throw new UserNotFoundErr('Unauthorized: You must be a global admin to create a plan');
  }

  // Verify that all features exist (they should be global now)
  const featureIds = data.features.map((f) => f.featureId);
  const existingFeatures = await db.feature.findMany({
    where: {
      id: { in: featureIds },
    },
  });

  if (existingFeatures.length !== featureIds.length) {
    const foundIds = new Set(existingFeatures.map((f) => f.id));
    const missingIds = featureIds.filter((id) => !foundIds.has(id));
    throw new Error(`Features not found: ${missingIds.join(', ')}`);
  }

  // Create the plan with its features
  const plan = await db.plan.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      durationInDays: data.durationInDays ?? null,
      features: {
        create: data.features.map((feature) => ({
          featureId: feature.featureId,
          dailyLimit: feature.dailyLimit ?? null,
          totalLimit: feature.totalLimit ?? null,
          resetInterval: feature.resetInterval,
        })),
      },
    },
    include: {
      features: {
        include: {
          feature: {
            include: {
              module: true,
            },
          },
        },
      },
    },
  });

  return plan;
}

/**
 * Gets all global features for plan selection
 * @returns Array of all active global features with their module information
 */
export async function getAllFeaturesForPlans() {
  const session = await currentSession();
  if (!session?.user.isGlobalAdmin) {
    throw new UserNotFoundErr('Unauthorized: You must be a global admin to view features');
  }

  const features = await db.feature.findMany({
    where: {
      isActive: true,
      deletedAt: null,
    },
    include: {
      module: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      {
        module: {
          name: 'asc',
        },
      },
      {
        name: 'asc',
      },
    ],
  });

  return features;
}

/**
 * Gets all plans for selection
 * @returns Array of all plans
 */
export async function getAllPlans() {
  const session = await currentSession();
  if (!session?.user.isGlobalAdmin) {
    throw new UserNotFoundErr('Unauthorized: You must be a global admin to view plans');
  }

  const plans = await db.plan.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return plans;
}
