'use server';

import { currentSession } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { RequirementTypeDefaultArgs } from '@/types/zenstackhq/requirementType';
import { RequirementTypeFormValues } from '@/components/common/requirement-type/requirement-type-form';

class UserNotFoundErr extends Error {}

export const getRequirementTypesAsOptions = async (tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const db = await getDb();
  return await db.requirementType.findMany({ ...RequirementTypeDefaultArgs, where: { tenantId, isActive: true } });
};

export const getRequirementTypeAsFormById = async (id: string, tenantId: string): Promise<RequirementTypeFormValues> => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const db = await getDb();
  const requirementType = await db.requirementType.findFirstOrThrow({
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      //isDefault: true,
    },
    where: { id, tenantId },
  });

  return {
    ...requirementType,
    isDefault: false,
    description: requirementType.description ?? '',
  };
};

export const CreateRequirementType = async (data: Omit<RequirementTypeFormValues, 'id' | 'isDefault'>, tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const { name, description, isActive } = data;

  // Validate required fields
  if (!name) {
    throw new Error('Name is required');
  }

  const db = await getDb();

  // Check if name already exists for this tenant
  const existingRequirementType = await db.requirementType.findFirst({
    where: { name, tenantId },
  });

  if (existingRequirementType) {
    throw new Error('A requirement type with this name already exists');
  }

  const requirementType = await db.requirementType.create({
    data: {
      name,
      description: description || '',
      isActive: isActive ?? true,
      tenantId,
      createdBy: session.user.id,
    },
  });

  return requirementType;
};

export const UpdateRequirementType = async (id: string, data: Omit<RequirementTypeFormValues, 'id' | 'isDefault'>, tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const { name, description, isActive } = data;

  // Validate required fields
  if (!name) {
    throw new Error('Name is required');
  }

  const db = await getDb();

  // Check if requirement type exists and belongs to tenant
  const existingRequirementType = await db.requirementType.findFirst({
    where: { id, tenantId },
  });

  if (!existingRequirementType) {
    throw new Error('Requirement type not found');
  }

  // Check if name already exists for this tenant (excluding current requirement type)
  const duplicateName = await db.requirementType.findFirst({
    where: {
      name,
      tenantId,
      id: { not: id },
    },
  });

  if (duplicateName) {
    throw new Error('A requirement type with this name already exists');
  }

  const requirementType = await db.requirementType.update({
    where: { id, tenantId },
    data: {
      name,
      description: description || '',
      isActive: isActive ?? true,
      updatedBy: session.user.id,
    },
  });

  return requirementType;
};
