'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';

import { db } from '@/server/db';
import { SettingsSchema } from '@/services/schemas';
import { getUserByEmail, getUserById } from '@/services/data/user';
import { currentUser } from '@/services/lib/auth';
import { generateVerificationToken } from '@/services/lib/tokens';
import { sendVerificationEmail } from '@/services/lib/mail';
import { update } from '@/server/auth';

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const user = await currentUser();

  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }

  const dbUser = await getUserById(user.id);

  if (!dbUser) {
    return { error: 'Unauthorized' };
  }

  if (user.isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
  }

  if (values.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email);

    if (existingUser && existingUser.id !== user.id) {
      return { error: 'Email already in use!' };
    }

    const verificationToken = await generateVerificationToken(values.email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    return { success: 'Verification email sent!' };
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordsMatch = await bcrypt.compare(values.password, dbUser.password);

    if (!passwordsMatch) {
      return { error: 'Incorrect password!' };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);
    values.password = hashedPassword;
    values.newPassword = undefined;
  }

  const updatedUser = await db.user.update({
    where: { id: dbUser.id },
    data: {
      ...values,
    },
  });

  // todo: get permission from the user to update their permissions

  void update({
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      // todo: assign permissions to the user
      // permissions: updatedUser.permissions,
    },
  });

  return { success: 'Settings Updated!' };
};
