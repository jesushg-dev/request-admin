import { cache } from 'react';
import NextAuth from 'next-auth';

import { authConfig } from './config';

const { auth: uncachedAuth, handlers, signIn, signOut, unstable_update: update } = NextAuth(authConfig);

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut, update };
