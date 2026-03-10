// TypeScript ESM mock for '@/server/auth-server' used by tests.
// Export named mocks so importing modules that use named imports work correctly.
import { jest } from '@jest/globals';

export const currentSession = jest.fn();
export const requireUser = jest.fn();

export const auth = {
  api: {
    signOut: jest.fn(),
    signUpEmail: jest.fn(),
    createInvitation: jest.fn(),
    acceptInvitation: jest.fn(),
    listMembers: jest.fn(),
  },
};

export default {
  currentSession,
  requireUser,
  auth,
};
