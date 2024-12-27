import { getAccountByUserId } from '@/services/data/account';
import { getTwoFactorConfirmationByUserId } from '@/services/data/two-factor-confirmation';
import { getUserByEmail, getUserById, getUserByIdWithFeatures } from '@/services/data/user';
import { LoginSchema } from '@/services/schemas';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import Github from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

import { db } from '../db-client';

export type ExtendedUser = DefaultSession['user'] & {
  id: string;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
  features: string[];
  roles: string[];
  firstName: string;
  lastName: string;
  isGlobalAdmin: boolean;
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') return true;

      if (!user.id) return false;

      const existingUser = await getUserById(user.id);

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

        if (!twoFactorConfirmation) return false;

        // Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },
    async session({ token, session }) {
      if (!session.user) return session;

      session.user.name = token.name;
      session.user.email = token.email!;
      session.user.isOAuth = token.isOAuth as boolean;
      session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      session.user.features = token.features as string[] | [];
      session.user.roles = token.roles as string[] | [];
      session.user.image = token.image as string;
      session.user.firstName = token.firstName as string;
      session.user.lastName = token.lastName as string;
      session.user.isGlobalAdmin = token.isGlobalAdmin as boolean;

      if (token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserByIdWithFeatures(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOAuth = !!existingAccount;
      token.email = existingUser.email;
      token.picture = existingUser.person?.image;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      token.features = existingUser.features || [];
      token.roles = existingUser.roles || [];
      token.name = existingUser.person?.firstName && existingUser.person?.lastName ? `${existingUser.person.firstName} ${existingUser.person.lastName}` : 'No Name';
      token.image = existingUser.person?.image || '';
      token.firstName = existingUser.person?.firstName || '';
      token.lastName = existingUser.person?.lastName || '';
      token.isGlobalAdmin = existingUser.isGlobalAdmin;

      return token;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    DiscordProvider,
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);
          if (!user?.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
} satisfies NextAuthConfig;
