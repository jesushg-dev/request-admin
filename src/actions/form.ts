'use server';

import { auth } from '@/server/auth';
import { db } from '@/server/db-server';
import { formSchema, formSchemaType, keysSchema } from '@/services/schemas/form';

class UserNotFoundErr extends Error {}

export async function GetFormStats() {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  const stats = await db.form.aggregate({
    where: {
      userId: session.user.id,
    },
    _sum: {
      visits: true,
      submissions: true,
    },
  });

  const visits = stats._sum.visits || 0;
  const submissions = stats._sum.submissions || 0;

  let submissionRate = 0;

  if (visits > 0) {
    submissionRate = (submissions / visits) * 100;
  }

  const bounceRate = 100 - submissionRate;

  return {
    visits,
    submissions,
    submissionRate,
    bounceRate,
  };
}

export async function CreateForm(data: formSchemaType, tenantId: string) {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  const validation = formSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('form not valid');
  }

  const { name, description } = data;

  const form = await db.form.create({
    data: {
      userId: session.user.id,
      name,
      description,
      tenantId,
    },
  });

  if (!form) {
    throw new Error('something went wrong');
  }

  return form.id;
}

export async function GetForms() {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  return await db.form.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function GetFormById(id: string, tenantId: string) {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  return await db.form.findUnique({
    where: { userId: session.user.id, id, tenantId },
  });
}

export async function UpdateFormContent(id: string, jsonContent: string) {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  return await db.form.update({
    where: {
      userId: session.user.id,
      id,
    },
    data: {
      content: jsonContent,
    },
  });
}

export async function PublishForm(id: string) {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  return await db.form.update({
    data: {
      published: true,
    },
    where: {
      userId: session.user.id,
      id,
    },
  });
}

export async function GetFormContentByUrl(formUrl: string, tenantId: string) {
  return await db.form.update({
    select: {
      id: true,
      name: true,
      content: true,
    },
    data: {
      visits: {
        increment: 1,
      },
    },
    where: {
      tenantId,
      shareURL: formUrl,
      published: true,
      isPublic: true,
    },
  });
}

export async function GetFormContentById(id: string, tenantId: string) {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  return await db.form.update({
    select: {
      id: true,
      name: true,
      description: true,
      content: true,
    },
    data: {
      visits: {
        increment: 1,
      },
    },
    where: {
      tenantId,
      id,
      published: true,
    },
  });
}

export async function SubmitForm(tenantId: string, formId: string, content: string) {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  const keys = keysSchema.safeParse(JSON.parse(content));
  if (!keys.success) throw new Error('invalid keys provided');

  const keysData = Object.entries(keys.data).map(([key, value]) => ({ key, value, tenantId }));

  return await db.form.update({
    data: {
      submissions: {
        increment: 1,
      },
      formSubmissions: {
        create: [
          {
            content,
            tenantId,
            keys: {
              createMany: { data: keysData },
            },
          },
        ],
      },
    },
    where: {
      id: formId,
      published: true,
    },
  });
}
