"use server";

import { z } from "zod";
import { getDb } from "@/server/db-client";
import { randomUUID } from "crypto";
import { auth } from "@/server/auth-server";
import { headers } from "next/headers";
import { themeStylesSchema, type ThemeStyles } from "@/features/theme-designer/types/theme";
import { cache } from "react";
import {
  UnauthorizedError,
  ValidationError,
  ThemeNotFoundError,
  ThemeLimitError,
} from "@/types/errors";
import { MAX_FREE_THEMES } from "@/features/theme-designer/utils/constants";
import { getMyActiveSubscription } from "@/features/theme-designer/utils/subscription";

// Helper to get user ID with better error handling
async function getCurrentUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  return session.user.id;
}

// Log errors for observability
function logError(error: Error, context: Record<string, any>) {
  console.error("Theme action error:", error, context);
  if (error.name === "UnauthorizedError" || error.name === "ValidationError") {
    console.warn("Expected error:", { error: error.message, context });
  } else {
    console.error("Unexpected error:", { error: error.message, stack: error.stack, context });
  }
}

const createThemeSchema = z.object({
  name: z.string().min(1, "Theme name cannot be empty").max(50, "Theme name too long"),
  styles: themeStylesSchema,
});

const updateThemeSchema = z.object({
  id: z.string().min(1, "Theme ID required"),
  name: z.string().min(1, "Theme name cannot be empty").max(50, "Theme name too long").optional(),
  styles: themeStylesSchema.optional(),
});

export async function getThemes() {
  try {
    const userId = await getCurrentUserId();
    const db = await getDb();
    const userThemes = await db.theme.findMany({
      where: { userId },
    });
    // Parse styles from string to object
    return userThemes.map((t) => ({
      ...t,
      styles: JSON.parse(t.styles) as ThemeStyles
    }));
  } catch (error) {
    logError(error as Error, { action: "getThemes" });
    throw error;
  }
}

export const getTheme = cache(async (themeId: string) => {
  try {
    if (!themeId) {
      throw new ValidationError("Theme ID required");
    }

    const db = await getDb();
    const theme = await db.theme.findUnique({
      where: { id: themeId },
    });

    if (!theme) {
      throw new ThemeNotFoundError();
    }

    return {
      ...theme,
      styles: JSON.parse(theme.styles) as ThemeStyles
    };
  } catch (error) {
    logError(error as Error, { action: "getTheme", themeId });
    throw error;
  }
});

export async function createTheme(formData: { name: string; styles: ThemeStyles }) {
  try {
    const userId = await getCurrentUserId();
    const db = await getDb();

    const validation = createThemeSchema.safeParse(formData);
    if (!validation.success) {
      throw new ValidationError("Invalid input", validation.error.format());
    }

    // Check theme limit
    const userThemesCount = await db.theme.count({
      where: { userId },
    });

    if (userThemesCount >= MAX_FREE_THEMES) {
      const activeSubscription = await getMyActiveSubscription(userId);
      const isSubscribed =
        !!activeSubscription &&
        activeSubscription?.productId === process.env.NEXT_PUBLIC_TWEAKCN_PRO_PRODUCT_ID;

      if (!isSubscribed) {
        throw new ThemeLimitError(`You cannot have more than ${MAX_FREE_THEMES} themes.`);
      }
    }

    const { name, styles } = validation.data;
    const newThemeId = randomUUID();

    const insertedTheme = await db.theme.create({
      data: {
        id: newThemeId,
        userId: userId,
        name: name,
        styles: JSON.stringify(styles),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      ...insertedTheme,
      styles: JSON.parse(insertedTheme.styles) as ThemeStyles
    };
  } catch (error) {
    logError(error as Error, { action: "createTheme", formData: { name: formData.name } });
    throw error;
  }
}

export async function updateTheme(formData: { id: string; name?: string; styles?: ThemeStyles }) {
  try {
    const userId = await getCurrentUserId();
    const db = await getDb();

    const validation = updateThemeSchema.safeParse(formData);
    if (!validation.success) {
      throw new ValidationError("Invalid input", validation.error.format());
    }

    const { id: themeId, name, styles } = validation.data;

    if (!name && !styles) {
      throw new ValidationError("No update data provided");
    }

    const updateData: { name?: string; styles?: string; updatedAt: Date } = {
      updatedAt: new Date(),
    };
    if (name) updateData.name = name;
    if (styles) updateData.styles = JSON.stringify(styles);

    // Verify ownership
    const existingTheme = await db.theme.findFirst({
      where: { id: themeId, userId }
    });

    if (!existingTheme) {
      throw new ThemeNotFoundError("Theme not found or not owned by user");
    }

    const updatedTheme = await db.theme.update({
      where: { id: themeId },
      data: updateData
    });

    return {
      ...updatedTheme,
      styles: JSON.parse(updatedTheme.styles) as ThemeStyles
    };
  } catch (error) {
    logError(error as Error, { action: "updateTheme", themeId: formData.id });
    throw error;
  }
}

export async function deleteTheme(themeId: string) {
  try {
    const userId = await getCurrentUserId();
    const db = await getDb();

    if (!themeId) {
      throw new ValidationError("Theme ID required");
    }

    // Verify ownership
    const existingTheme = await db.theme.findFirst({
      where: { id: themeId, userId }
    });

    if (!existingTheme) {
      throw new ThemeNotFoundError("Theme not found or not owned by user");
    }

    const deletedTheme = await db.theme.delete({
      where: { id: themeId }
    });

    return deletedTheme;
  } catch (error) {
    logError(error as Error, { action: "deleteTheme", themeId });
    throw error;
  }
}
