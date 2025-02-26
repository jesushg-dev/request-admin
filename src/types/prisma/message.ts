import { Prisma } from '@prisma/client';

// Default select for Messages
export const MessageDefaultArgs = Prisma.validator<Prisma.MessageDefaultArgs>()({
  select: {
    id: true,
    userTenant: {
      select: {
        id: true,
        user: { select: { id: true, email: true } },
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
    createdAt: true,
    updatedAt: true,
  },
});

// Type for Messages with selected fields
export type MessageType = Prisma.MessageGetPayload<typeof MessageDefaultArgs>;
