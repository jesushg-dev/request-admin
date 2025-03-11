import {
  adminClient,
  anonymousClient,
  apiKeyClient,
  emailOTPClient,
  genericOAuthClient,
  inferAdditionalFields,
  magicLinkClient,
  multiSessionClient,
  oidcClient,
  oneTapClient,
  organizationClient,
  passkeyClient,
  phoneNumberClient,
  ssoClient,
  twoFactorClient,
  usernameClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { auth } from './auth-server';

export const authClient = createAuthClient({
  // baseURL: process.env.BETTER_AUTH_URL,
  baseURL: 'http://localhost:3000',
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
    adminClient(),
    organizationClient(),
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

/*
export const currentFeatures = async () => {
  const session = await authClient.getSession();

  return session?.data?.user?.features ?? [];
};
*/
