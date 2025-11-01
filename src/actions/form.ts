'use server';

import { currentSession } from '@/server/auth-server';
import { getDb } from '@/server/db-client';
import { formSchema, formSchemaType, keysSchema } from '@/services/schemas/form';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';

import { UserNotFoundErr } from '@/lib/error';

export const getFormsAsOptions = async (tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const db = await getDb();
  const Forms = await db.form.findMany({ select: { id: true, name: true }, where: { tenantId } });
  const preparedForms = Forms.map((req) => ({ value: req.id, label: req.name }));

  return preparedForms;
};

export async function GetFormStats(tenantId: string) {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const db = await getDb();
  const stats = await db.form.aggregate({
    where: { tenantId },
    _sum: { visits: true, submissions: true },
  });

  const visits = stats._sum.visits || 0;
  const submissions = stats._sum.submissions || 0;

  let submissionRate = 0;

  if (visits > 0) {
    submissionRate = (submissions / visits) * 100;
  }

  const bounceRate = 100 - submissionRate;

  return { visits, submissions, submissionRate, bounceRate };
}

export async function CreateForm(data: formSchemaType, tenantId: string) {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  // RBAC check
  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.FORM_DESIGNER.CREATE]);
  if (!canCreate) {
    throw new Error('Forbidden: lacking permissions to create forms');
  }

  const validation = formSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('form not valid');
  }

  const { name, description, isPublic } = data;

  const db = await getDb();
  const form = await db.form.create({
    data: { name, description, tenantId, isPublic },
  });

  if (!form) throw new Error('something went wrong');

  return form.id;
}

export async function GetForms(tenantId: string) {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const db = await getDb();
  return await db.form.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function GetFormById(id: string, tenantId: string) {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const db = await getDb();
  return await db.form.findUnique({
    where: { id, tenantId },
  });
}

export async function UpdateFormContent(id: string, jsonContent: string, tenantId: string) {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  // RBAC check
  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.FORM_DESIGNER.EDIT]);
  if (!canEdit) {
    throw new Error('Forbidden: lacking permissions to edit forms');
  }

  const db = await getDb();
  return await db.form.update({
    where: { id, tenantId },
    data: { content: jsonContent },
  });
}

export async function PublishForm(id: string, tenantId: string) {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  // RBAC check
  const auth = await getAuthContext(tenantId);
  const canPublish = auth.hasPermissions([PermissionActions.FORM_DESIGNER.PUBLISH]);
  if (!canPublish) {
    throw new Error('Forbidden: lacking permissions to publish forms');
  }

  const db = await getDb();
  return await db.form.update({
    data: {
      published: true,
    },
    where: { tenantId, id },
  });
}

export async function GetFormContentByUrl(formUrl: string, tenantId: string) {
  const db = await getDb();
  return await db.form.update({
    select: { id: true, name: true, content: true },
    data: { visits: { increment: 1 } },
    where: { tenantId, shareURL: formUrl, published: true, isPublic: true },
  });
}

export async function GetFormContentById(id: string, tenantId: string) {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const db = await getDb();
  return await db.form.update({
    select: { id: true, name: true, description: true, content: true },
    data: { visits: { increment: 1 } },
    where: { tenantId, id, published: true },
  });
}

export async function DeleteForm(id: string, tenantId: string) {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  // RBAC check
  const auth = await getAuthContext(tenantId);
  const canDelete = auth.hasPermissions([PermissionActions.FORM_DESIGNER.DELETE]);
  if (!canDelete) {
    throw new Error('Forbidden: lacking permissions to delete forms');
  }

  const db = await getDb();
  return await db.form.delete({
    where: { id, tenantId },
  });
}

export async function SubmitForm(tenantId: string, formId: string, content: Record<string, string>) {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const keys = keysSchema.safeParse(content);
  if (!keys.success) throw new Error('invalid keys provided');

  const keysData = Object.entries(keys.data).map(([key, value]) => ({ key, value, tenantId }));

  const db = await getDb();
  return await db.form.update({
    data: {
      submissions: { increment: 1 },
      formSubmissions: {
        create: [
          {
            content: JSON.stringify(content),
            tenantId,
            keys: {
              createMany: { data: keysData },
            },
          },
        ],
      },
    },
    where: { id: formId, published: true },
  });
}
