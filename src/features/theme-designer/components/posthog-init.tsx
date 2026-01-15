"use client";

import { useEffect } from "react";
import { initPostHog } from "@/features/theme-designer/utils/posthog";

export function PostHogInit() {
  useEffect(() => {
    initPostHog();
  }, []);

  return null;
}
