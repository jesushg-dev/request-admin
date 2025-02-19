'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { CustomCheckbox } from './custom-checkbox';

// ===================
// Zod Schema
// ===================
// This schema validates the user fields.
// You can move it to a separate file (e.g., /app/schemas/userSchema.ts) if desired.
export const userSchema = z.object({
  user: z.object({
    username: z.string().min(1, { message: 'error.usernameRequired' }),
    email: z.string().email({ message: 'error.invalidEmail' }),
    password: z.string().min(6, { message: 'error.passwordMin' }),
    isTwoFactorEnabled: z.boolean().default(false),
    isGlobalAdmin: z.boolean().default(false),
  }),
});

export type UserFormValues = z.infer<typeof userSchema>;

// ===================
// Component
// ===================
export function UserForm() {
  const { control } = useFormContext<UserFormValues>();

  return (
    <div className="m-1 flex flex-col gap-4">
      {/* Username Field */}
      <FormField
        control={control}
        name="user.username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{'user.username'}</FormLabel>
            <FormControl>
              <Input id="user.username" placeholder="Enter username" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Email Field */}
      <FormField
        control={control}
        name="user.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{'user.email'}</FormLabel>
            <FormControl>
              <Input id="user.email" type="email" placeholder="Enter email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Password Field */}
      <FormField
        control={control}
        name="user.password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{'user.password'}</FormLabel>
            <FormControl>
              <Input id="user.password" type="password" placeholder="Enter password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Two-Factor Authentication Checkbox */}
      <FormField
        control={control}
        name="user.isTwoFactorEnabled"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <CustomCheckbox id="user.isTwoFactorEnabled" checked={field.value} onCheckedChange={field.onChange} label="user.enableTwoFactor" description="user.enableTwoFactorDesc" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Global Admin Checkbox */}
      <FormField
        control={control}
        name="user.isGlobalAdmin"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <CustomCheckbox id="user.isGlobalAdmin" checked={field.value} onCheckedChange={field.onChange} label="user.globalAdmin" description="user.globalAdminDesc" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
