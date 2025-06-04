import { headers } from 'next/headers';
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
import { passkey } from 'better-auth/plugins/passkey';
import { sso } from 'better-auth/plugins/sso';

import { sendChangeEmailVerification, sendInvitationEmail, sendMagicLink, sendResetPassword, sendVerificationEmail, sendVerificationOTP } from '@/lib/mail';
import { comparePassword, hashPassword } from '@/lib/password';

import { db } from './db-server';

export const auth = betterAuth({
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
    nextCookies(),
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
        minExpiresIn: 24, // 1 day
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
  ],
});

export const currentSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};
