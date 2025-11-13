/**
 * Settings Schemas with Next-Intl Internationalization
 * =====================================================
 *
 * This file re-exports all settings schemas from their individual files.
 * Each schema is now in its own file for better scalability and i18n-ally support.
 *
 * For Client Components - Use the hooks (useProfileSchema, etc.):
 * ```tsx
 * 'use client';
 * import { useProfileSchema, type TProfileSchema } from '@/services/schemas/settings.schema';
 * import { useForm } from 'react-hook-form';
 * import { zodResolver } from '@hookform/resolvers/zod';
 *
 * const profileSchema = useProfileSchema();
 * const form = useForm<TProfileSchema>({
 *   resolver: zodResolver(profileSchema),
 * });
 * ```
 *
 * For Server Actions - Use the factory functions:
 * ```tsx
 * 'use server';
 * import { createProfileSchema } from '@/services/schemas/settings.schema';
 * import { getTranslations } from 'next-intl/server';
 *
 * const t = await getTranslations('admin.setting.account.validation');
 * const schema = createProfileSchema(t);
 * const result = schema.safeParse(data);
 * ```
 */

// Profile Schema
export {
  createProfileSchema,
  useProfileSchema,
  type TProfileSchema,
} from './settings/profile.schema';

// Password Change Schema
export {
  createPasswordChangeSchema,
  usePasswordChangeSchema,
  type TPasswordChangeSchema,
} from './settings/password.schema';

// Email Change Schema
export {
  createEmailChangeSchema,
  useEmailChangeSchema,
  type TEmailChangeSchema,
} from './settings/email.schema';

// Subscription Schema
export {
  createSubscriptionSchema,
  useSubscriptionSchema,
  type TSubscriptionSchema,
} from './settings/subscription.schema';

// Notifications Schema
export {
  createNotificationsSchema,
  useNotificationsSchema,
  type TNotificationsSchema,
} from './settings/notifications.schema';

// Appearance Schema
export {
  createAppearanceSchema,
  useAppearanceSchema,
  type TAppearanceSchema,
} from './settings/appearance.schema';
