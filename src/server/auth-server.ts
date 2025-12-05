import { cache } from 'react';
import { headers } from 'next/headers';
import { passkey } from '@better-auth/passkey';
import { sso } from '@better-auth/sso';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import {
  admin,
  anonymous,
  apiKey,
  bearer,
  emailOTP,
  genericOAuth,
  jwt,
  magicLink,
  multiSession,
  oAuthProxy,
  oidcProvider,
  oneTap,
  openAPI,
  organization,
  phoneNumber,
  twoFactor,
  username,
} from 'better-auth/plugins';

import { sendChangeEmailVerification, sendInvitationEmail, sendMagicLink, sendResetPassword, sendVerificationEmail, sendVerificationOTP } from '@/lib/mail';
import { comparePassword, hashPassword } from '@/lib/password';

import { db } from './db-client';

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  database: prismaAdapter(db, {
    provider: 'sqlserver',
  }),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: hashPassword,
      verify: comparePassword,
    },
    sendResetPassword,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail,
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification,
    },
    additionalFields: {
      isGlobalAdmin: {
        input: false,
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },
  plugins: [
    twoFactor({
      issuer: process.env.APP_NAME || 'Requestum',
      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendVerificationOTP(user.email, otp, 'two-factor');
        },
      },
    }),
    jwt(),
    openAPI(),
    oAuthProxy(),
    multiSession(),
    bearer(),
    sso(),
    oidcProvider({
      loginPage: '/sign-in',
    }),
    organization({
      teams: {
        enabled: true,
        allowRemovingAllTeams: false,
      },
      sendInvitationEmail: async (data) => {
        await sendInvitationEmail({
          id: data.invitation.id,
          role: data.role,
          email: data.email,
          organizationName: data.organization.name,
          invitedByName: data.inviter.user.name,
          invitedByEmail: data.inviter.user.email,
        });
      },
      schema: {
        organization: {
          modelName: 'Tenant',
        },
        member: {
          modelName: 'UserTenant',
          fields: {
            organizationId: 'tenantId',
          },
          additionalFields: {
            isActive: {
              type: 'boolean',
              input: true,
              required: false,
              defaultValue: true,
            },
          },
        },
        invitation: {
          modelName: 'InvitationTenant',
          fields: {
            organizationId: 'tenantId',
          },
        },
        team: {
          modelName: 'Area',
          fields: {
            organizationId: 'tenantId',
          },
        },
        session: {
          fields: {
            activeOrganizationId: 'activeTenantId',
          },
        },
      },
    }),
    admin(),
    apiKey({
      enableMetadata: true,
      rateLimit: {
        enabled: true,
        timeWindow: 1000 * 60 * 60 * 24, // 1 day
        maxRequests: 1000, // 1,000 requests per day
      },
      keyExpiration: {
        minExpiresIn: 1, // 1 day
        maxExpiresIn: 365, // 1 year
        defaultExpiresIn: 7, // 7 days
      },
    }),
    oneTap(),
    genericOAuth({
      config: [],
    }),
    passkey(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        sendVerificationOTP(email, otp, type);
      },
    }),
    magicLink({
      sendMagicLink({ email, token, url }) {
        sendMagicLink(email, token, url);
      },
    }),
    phoneNumber(),
    anonymous(),
    username(),
    nextCookies(), // make sure this is the last plugin in the array
  ],
});

/**
 * Gets the current session with request-level caching.
 * Uses React's cache() to ensure the session is only fetched once per request,
 * avoiding duplicate database queries.
 */
export const currentSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});

export async function requireSession() {
  const session = await currentSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return session;
}

export async function requireUser() {
  const session = await requireSession();
  return session.user;
}
