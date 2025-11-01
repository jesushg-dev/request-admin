import { Prisma } from '@zenstackhq/runtime/models';

// Default select for Messages
export const MessageDefaultArgs = Prisma.validator<Prisma.MessageDefaultArgs>()({
  select: {
    id: true,
    userTenant: {
      select: {
        id: true,
        user: { select: { id: true, email: true, username: true } },
        person: { select: { firstName: true, lastName: true, image: true } },
      },
    },
    reactions: {
      select: {
        id: true,
        value: true,
        userTenant: {
          select: {
            id: true,
            person: { select: { firstName: true, lastName: true } },
          },
        },
      },
    },
    body: true,
    imageId: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
    _count: {
      select: {
        reactions: true,
        replies: true,
      },
    },
  },
});

// Type for Messages with selected fields
export type MessageType = Prisma.MessageGetPayload<typeof MessageDefaultArgs>;
export type UserTenantType = MessageType['userTenant'];
