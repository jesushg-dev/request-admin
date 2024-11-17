'use server';

import { auth } from '@/server/auth';
import { db } from '@/services/lib/db';
import { formSchema, formSchemaType } from '@/services/schemas/form';

class UserNotFoundErr extends Error {}

export async function GetFormStats() {
  const session = await auth();
  if (!session) {
    throw new UserNotFoundErr();
  }

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

export async function CreateForm(data: formSchemaType) {
  const validation = formSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('form not valid');
  }

  const session = await auth();
  if (!session) {
    throw new UserNotFoundErr();
  }

  const { name, description } = data;

  const form = await db.form.create({
    data: {
      userId: session.user.id,
      name,
      description,
      tenantId: session.user.tenantId,
    },
  });

  if (!form) {
    throw new Error('something went wrong');
  }

  return form.id;
}

export async function GetForms() {
  const session = await auth();
  if (!session) {
    throw new UserNotFoundErr();
  }

  return await db.form.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function GetFormById(id: string) {
  const session = await auth();
  if (!session) {
    throw new UserNotFoundErr();
  }

  return await db.form.findUnique({
    where: {
      userId: session.user.id,
      id,
    },
  });
}

export async function UpdateFormContent(id: string, jsonContent: string) {
  const session = await auth();
  if (!session) {
    throw new UserNotFoundErr();
  }

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
  if (!session) {
    throw new UserNotFoundErr();
  }

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

export async function GetFormContentByUrl(formUrl: string) {
  return await db.form.update({
    select: {
      content: true,
    },
    data: {
      visits: {
        increment: 1,
      },
    },
    where: {
      shareURL: formUrl,
    },
  });
}

export async function SubmitForm(tenantId: string, formUrl: string, content: string) {
  return await db.form.update({
    data: {
      submissions: {
        increment: 1,
      },
      FormSubmission: {
        create: [
          {
            content,
            tenantId,
          },
        ],
      },
    },
    where: {
      shareURL: formUrl,
      published: true,
    },
  });
}

export async function GetFormWithSubmissions(id: string) {
  const session = await auth();
  if (!session) {
    throw new UserNotFoundErr();
  }

  return await db.form.findUnique({
    where: {
      userId: session.user.id,
      id,
    },
    include: {
      FormSubmission: true,
    },
  });
}
