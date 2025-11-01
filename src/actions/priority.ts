'use server';

import { currentSession } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { RequestPriorityTypeDefaultArgs } from '@/types/zenstackhq/priority';
import { RequestPriorityTypeFormValues } from '@/components/common/priority/priority-form';

class UserNotFoundErr extends Error {}

export const getRequestPriorityTypesAsOptions = async (tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const db = await getDb();
  return await db.requestPriorityType.findMany({ ...RequestPriorityTypeDefaultArgs, where: { tenantId, isActive: true } });
};

export const getRequestPriorityTypeAsFormById = async (id: string, tenantId: string): Promise<RequestPriorityTypeFormValues> => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const db = await getDb();
  const priority = await db.requestPriorityType.findFirstOrThrow({
    select: {
      id: true,
      name: true,
      description: true,
      primaryColor: true,
      level: true,
      isActive: true,
      //isDefault: true,
    },
    where: { id, tenantId },
  });

  return {
    ...priority,
    isDefault: false,
    description: priority.description ?? '',
  };
};

export const CreateRequestPriorityType = async (data: Omit<RequestPriorityTypeFormValues, 'id' | 'isDefault'>, tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const { name, description, primaryColor, level, isActive } = data;

  // Validate required fields
  if (!name || !primaryColor) {
    throw new Error('Name and color are required');
  }

  const db = await getDb();

  // Check if name already exists for this tenant
  const existingPriority = await db.requestPriorityType.findFirst({
    where: { name, tenantId },
  });

  if (existingPriority) {
    throw new Error('A priority type with this name already exists');
  }

  const priority = await db.requestPriorityType.create({
    data: {
      name,
      description: description || '',
      primaryColor,
      level: level || 0,
      isActive: isActive ?? true,
      tenantId,
      createdBy: session.user.id,
    },
  });

  return priority;
};

export const UpdateRequestPriorityType = async (id: string, data: Omit<RequestPriorityTypeFormValues, 'id' | 'isDefault'>, tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const { name, description, primaryColor, level, isActive } = data;

  // Validate required fields
  if (!name || !primaryColor) {
    throw new Error('Name and color are required');
  }

  const db = await getDb();

  // Check if priority exists and belongs to tenant
  const existingPriority = await db.requestPriorityType.findFirst({
    where: { id, tenantId },
  });

  if (!existingPriority) {
    throw new Error('Priority type not found');
  }

  // Check if name already exists for this tenant (excluding current priority)
  const duplicateName = await db.requestPriorityType.findFirst({
    where: {
      name,
      tenantId,
      id: { not: id },
    },
  });

  if (duplicateName) {
    throw new Error('A priority type with this name already exists');
  }

  const priority = await db.requestPriorityType.update({
    where: { id, tenantId },
    data: {
      name,
      description: description || '',
      primaryColor,
      level: level || 0,
      isActive: isActive ?? true,
      updatedBy: session.user.id,
    },
  });

  return priority;
};
