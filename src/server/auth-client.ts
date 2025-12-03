import {
  adminClient,
  anonymousClient,
  apiKeyClient,
  emailOTPClient,
  genericOAuthClient,
  inferAdditionalFields,
  jwtClient,
  magicLinkClient,
  multiSessionClient,
  oidcClient,
  oneTapClient,
  organizationClient,
  phoneNumberClient,
  twoFactorClient,
  usernameClient,
} from 'better-auth/client/plugins';
import { passkeyClient } from '@better-auth/passkey/client';
import { ssoClient } from '@better-auth/sso/client';
import { createAuthClient } from 'better-auth/react';

import { auth } from './auth-server';

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    usernameClient(),
    anonymousClient(),
    phoneNumberClient(),
    magicLinkClient(),
    emailOTPClient(),
    passkeyClient(),
    genericOAuthClient(),
    oneTapClient({ clientId: 'MY_CLIENT_ID' }),
    apiKeyClient(),
    jwtClient(),
    adminClient(),
    organizationClient({
      teams: {
        enabled: true,
      },
      schema: {
        member: {
          additionalFields: {
            isActive: {
              type: 'boolean',
              defaultValue: true,
            },
          },
        },
      },
    }),
    oidcClient(),
    ssoClient(),
    multiSessionClient(),
    twoFactorClient(),
  ],
});

export const { useSession } = authClient;

export const currentUser = async () => {
  const session = await authClient.getSession();
  return session?.data?.user;
};
