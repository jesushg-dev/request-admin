import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    APP_NAME: z.string(),
    BETTER_AUTH_URL: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    // External email / upload services are optional and typically disabled on-premise.
    RESEND_API_KEY: z.string().optional(),
    UPLOADTHING_TOKEN: z.string().optional(),
    RESEND_EMAIL_DOMAIN: z.string().optional(),
    // Feature flags to control use of any external SaaS. Default is on-premise (no SaaS).
    ON_PREMISE: z.boolean().default(true),
    ENABLE_EXTERNAL_EMAIL: z.boolean().default(false),
    ENABLE_EXTERNAL_SMS: z.boolean().default(false),
    ENABLE_EXTERNAL_UPLOAD: z.boolean().default(false),
    ENABLE_EXTERNAL_REALTIME: z.boolean().default(false),
    DATABASE_URL: z.string(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    APP_NAME: process.env.APP_NAME,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_EMAIL_DOMAIN: process.env.RESEND_EMAIL_DOMAIN,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    ON_PREMISE: process.env.ON_PREMISE === 'true',
    ENABLE_EXTERNAL_EMAIL: process.env.ENABLE_EXTERNAL_EMAIL === 'true',
    ENABLE_EXTERNAL_SMS: process.env.ENABLE_EXTERNAL_SMS === 'true',
    ENABLE_EXTERNAL_UPLOAD: process.env.ENABLE_EXTERNAL_UPLOAD === 'true',
    ENABLE_EXTERNAL_REALTIME: process.env.ENABLE_EXTERNAL_REALTIME === 'true',
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
