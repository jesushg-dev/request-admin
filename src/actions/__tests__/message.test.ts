import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

import { findOrCreateConversation, UserNotFoundErr } from '../message';

// Mock the dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

jest.mock('@/server/db-client', () => ({
  db: {
    conversation: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('findOrCreateConversation', () => {
  const mockSession = {
    user: {
      id: 'user-1',
    },
  };

  const mockTenantId = 'tenant-1';
  const mockUserId = 'user-2';

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
  });

  it('should throw UserNotFoundErr when no session exists', async () => {
    (currentSession as jest.Mock).mockResolvedValue(null);

    await expect(findOrCreateConversation({ tenantId: mockTenantId, userId: mockUserId })).rejects.toThrow(UserNotFoundErr);
  });

  it('should return existing conversation when found', async () => {
    const mockExistingConversation = {
      id: 'conversation-1',
      tenantId: mockTenantId,
    };

    (db.conversation.findFirst as jest.Mock).mockResolvedValue(mockExistingConversation);

    const result = await findOrCreateConversation({
      tenantId: mockTenantId,
      userId: mockUserId,
    });

    expect(result).toEqual(mockExistingConversation);
    expect(db.conversation.findFirst).toHaveBeenCalledWith({
      where: {
        tenantId: mockTenantId,
        OR: [
          {
            AND: [{ userTenantOne: { userId: mockSession.user.id } }, { userTenantTwo: { userId: mockUserId } }],
          },
          {
            AND: [{ userTenantOne: { userId: mockUserId } }, { userTenantTwo: { userId: mockSession.user.id } }],
          },
        ],
      },
    });
    expect(db.conversation.create).not.toHaveBeenCalled();
  });

  it('should create new conversation when none exists', async () => {
    const mockNewConversation = {
      id: 'conversation-2',
      tenantId: mockTenantId,
    };

    (db.conversation.findFirst as jest.Mock).mockResolvedValue(null);
    (db.conversation.create as jest.Mock).mockResolvedValue(mockNewConversation);

    const result = await findOrCreateConversation({
      tenantId: mockTenantId,
      userId: mockUserId,
    });

    expect(result).toEqual(mockNewConversation);
    expect(db.conversation.create).toHaveBeenCalledWith({
      data: {
        tenant: { connect: { id: mockTenantId } },
        userTenantOne: {
          connect: {
            userId_tenantId: {
              userId: mockSession.user.id,
              tenantId: mockTenantId,
            },
          },
        },
        userTenantTwo: {
          connect: {
            userId_tenantId: {
              userId: mockUserId,
              tenantId: mockTenantId,
            },
          },
        },
      },
    });
  });
});
