'use client';

import React from 'react';
import type { FC } from 'react';
import { SessionProvider } from 'next-auth/react';

interface INexAuthSessionProviderProps {
  children: React.ReactNode;
}

const NexAuthSessionProvider: FC<INexAuthSessionProviderProps> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default NexAuthSessionProvider;
