import { jest } from '@jest/globals';

// Mock all dependencies
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('@/server/auth-server', () => ({
  auth: {
    api: {
      signOut: jest.fn(),
    },
  },
}));

// Import mocked modules with proper typing
const { headers } = jest.requireMock('next/headers') as { headers: jest.MockedFunction<() => Promise<Headers>> };
const { auth } = jest.requireMock('@/server/auth-server') as {
  auth: {
    api: {
      signOut: jest.MockedFunction<(params: { headers: Headers }) => Promise<void>>;
    };
  };
};
const { logout } = jest.requireActual('../logout') as { logout: () => Promise<void> };

describe('logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call auth.api.signOut with headers', async () => {
    // Arrange
    const mockHeaders = new Headers({ 'content-type': 'application/json' });
    headers.mockResolvedValue(mockHeaders);

    // Act
    await logout();

    // Assert
    expect(headers).toHaveBeenCalled();
    expect(auth.api.signOut).toHaveBeenCalledWith({
      headers: mockHeaders,
    });
  });

  it('should handle errors when signOut fails', async () => {
    // Arrange
    const mockError = new Error('Sign out failed');
    auth.api.signOut.mockRejectedValue(mockError);

    // Act & Assert
    await expect(logout()).rejects.toThrow('Sign out failed');
  });
});
