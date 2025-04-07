'use server';

import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';

// ========================
// Custom Error Classes
// ========================
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

class RequestNotFoundError extends Error {
  constructor(message: string = 'Request not found') {
    super(message);
    this.name = 'RequestNotFoundError';
  }
}

class RequestAssignmentError extends Error {
  constructor(message: string = 'No active request assignments found') {
    super(message);
    this.name = 'RequestAssignmentError';
  }
}

class ConcurrentModificationError extends Error {
  constructor(message: string = 'Database update conflict occurred') {
    super(message);
    this.name = 'ConcurrentModificationError';
  }
}

// ========================
// Type Definitions
// ========================
type UUID = string;
type FieldName = 'status' | 'priority';
type DBField = 'statusId' | 'priorityId';

type UpdateRequestFieldParams = {
  tenantId: UUID;
  requestId: UUID;
  userId: UUID;
  fieldName: FieldName;
  dbField: DBField;
  newValue: UUID;
};

// ========================
// Validation Utilities
// ========================

const IsNotEmpy = (id: string, fieldName: string): void => {
  if (!id) {
    throw new ValidationError(`Invalid ${fieldName}: ${id}`);
  }
};

// ========================
// Core Update Function
// ========================
const updateRequestField = async ({ tenantId, requestId, userId, fieldName, dbField, newValue }: UpdateRequestFieldParams): Promise<Record<DBField, UUID>> => {
  try {
    // Validate input parameters
    IsNotEmpy(tenantId, 'tenantId');
    IsNotEmpy(requestId, 'requestId');
    IsNotEmpy(newValue, `${fieldName}Id`);
    IsNotEmpy(userId, 'userId');

    // Fetch current request state
    const request = await db.request.findUnique({
      where: { id: requestId, tenantId },
      select: {
        id: true,
        requestAssignments: {
          where: { isActive: true },
          select: { [dbField]: true },
        },
      },
    });

    if (!request) throw new RequestNotFoundError();
    if (request.requestAssignments.length === 0) {
      throw new RequestAssignmentError();
    }

    // Check for redundant update
    const currentValue = request.requestAssignments[0][dbField];

    // Atomic transaction with explicit string conversion
    try {
      await db.$transaction([
        db.request.update({
          where: { id: requestId, tenantId },
          data: {
            requestAssignments: {
              updateMany: {
                where: { isActive: true },
                data: { [dbField]: newValue },
              },
            },
          },
        }),
        db.requestChangeLog.create({
          data: {
            tenantId,
            requestId,
            changedBy: userId,
            fieldName,
            oldValue: String(currentValue), // Explicit string conversion
            newValue: String(newValue), // Explicit string conversion
            changedAt: new Date(),
          },
        }),
      ]);
    } catch (transactionError) {
      throw new ConcurrentModificationError(`Failed to update ${fieldName}: ${transactionError instanceof Error ? transactionError.message : 'Unknown error'}`);
    }

    return { [dbField]: newValue } as Record<DBField, UUID>;
  } catch (error) {
    console.error(`Request update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// ========================
// Public API Functions
// ========================
export const updateCurrentStatus = async (tenantId: UUID, requestId: UUID, statusId: UUID): Promise<{ statusId: UUID }> => {
  const session = await currentSession();

  if (!session?.user?.id) {
    throw new AuthorizationError('Authentication required');
  }

  return updateRequestField({
    tenantId,
    requestId,
    userId: session.user.id,
    fieldName: 'status',
    dbField: 'statusId',
    newValue: statusId,
  });
};

export const updateCurrentPriority = async (tenantId: UUID, requestId: UUID, priorityId: UUID): Promise<{ priorityId: UUID }> => {
  const session = await currentSession();

  if (!session?.user?.id) {
    throw new AuthorizationError('Authentication required');
  }

  return updateRequestField({
    tenantId,
    requestId,
    userId: session.user.id,
    fieldName: 'priority',
    dbField: 'priorityId',
    newValue: priorityId,
  });
};
