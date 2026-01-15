"use server";

import { getMyAllTimeRequestCount } from "@/features/theme-designer/actions/ai-usage";
import { SubscriptionRequiredError } from "@/types/errors";
import { SubscriptionCheck } from "@/types/subscription";
import { NextRequest } from "next/server";
import { AI_REQUEST_FREE_TIER_LIMIT } from "./constants";
import { getCurrentUserId } from "./shared";

// Simplified subscription check - returns null for now
// TODO: Implement proper subscription checking based on your subscription model
export async function getMyActiveSubscription(
  userId: string
): Promise<{ productId?: string; status?: string } | null> {
  // For now, return null (no active subscription)
  // This should be implemented based on your actual subscription model
  // The Prisma model uses tenantId and planId, so you may need to:
  // 1. Get the user's tenant
  // 2. Check for active subscription on that tenant
  // 3. Check if the plan includes theme designer features
  return null;
}

export async function validateSubscriptionAndUsage(userId: string): Promise<SubscriptionCheck> {
  try {
    const [activeSubscription, requestsUsed] = await Promise.all([
      getMyActiveSubscription(userId),
      getMyAllTimeRequestCount(userId),
    ]);

    const isSubscribed =
      !!activeSubscription &&
      activeSubscription?.productId === process.env.NEXT_PUBLIC_TWEAKCN_PRO_PRODUCT_ID;

    if (isSubscribed) {
      return {
        canProceed: true,
        hasSubscription: true,
        requestsUsed,
        requestsRemaining: Infinity, // Unlimited for subscribers
      };
    }

    const requestsRemaining = Math.max(0, AI_REQUEST_FREE_TIER_LIMIT - requestsUsed);
    const canProceed = requestsUsed < AI_REQUEST_FREE_TIER_LIMIT;

    if (!canProceed) {
      return {
        canProceed: false,
        hasSubscription: false,
        requestsUsed,
        requestsRemaining: 0,
        error: `You've reached your free limit of ${AI_REQUEST_FREE_TIER_LIMIT} requests. Please upgrade to continue.`,
      };
    }

    return {
      canProceed: true,
      hasSubscription: false,
      requestsUsed,
      requestsRemaining,
    };
  } catch (error) {
    console.error("Error validating subscription:", error);
    throw error;
  }
}

export async function requireSubscriptionOrFreeUsage(req: NextRequest): Promise<void> {
  const userId = await getCurrentUserId(req);
  const validation = await validateSubscriptionAndUsage(userId);

  if (!validation.canProceed) {
    throw new SubscriptionRequiredError(validation.error, {
      requestsRemaining: validation.requestsRemaining,
    });
  }
}
