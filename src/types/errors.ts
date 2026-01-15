import { z } from "zod";

export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends Error {
  details?: z.ZodFormattedError<unknown, string>;
  constructor(message: string, details?: z.ZodFormattedError<unknown, string>) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

export class SubscriptionRequiredError extends Error {
  data?: unknown;
  constructor(message: string = "Subscription required", data?: unknown) {
    super(message);
    this.name = "SubscriptionRequiredError";
    this.data = data;
  }
}

export class ThemeNotFoundError extends Error {
  constructor(message: string = "Theme not found") {
    super(message);
    this.name = "ThemeNotFoundError";
  }
}

export class ThemeLimitError extends Error {
  constructor(message: string = "Theme limit reached") {
    super(message);
    this.name = "ThemeLimitError";
  }
}

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "SUBSCRIPTION_REQUIRED"
  | "THEME_NOT_FOUND"
  | "THEME_LIMIT_ERROR"
  | "INTERNAL_ERROR"
  | "UNKNOWN_ERROR";

export const MyErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.unknown().optional(),
  message: z.string().optional(),
  status: z.number().optional(),
  data: z.unknown().optional(),
});

export type MyErrorResponse = z.infer<typeof MyErrorResponseSchema>;

