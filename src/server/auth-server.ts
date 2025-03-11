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

import { sendMagicLink, sendResetPassword, sendVerificationEmail, sendVerificationOTP } from '@/lib/mail';
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
    additionalFields: {
      isGlobalAdmin: {
        input: false,
        type: 'boolean',
        required: true,
        defaultValue: false,
      },
    },
  },
  plugins: [
    nextCookies(),
    twoFactor(),
    jwt(),
    openAPI(),
    oAuthProxy(),
    multiSession(),
    bearer(),
    sso(),
    oidcProvider({
      loginPage: '/sign-in',
    }),
    organization(),
    admin(),
    apiKey(),
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
    nextCookies(),
  ],
});

export const currentSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};
