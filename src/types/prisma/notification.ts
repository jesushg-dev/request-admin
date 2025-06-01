import { Prisma } from '@prisma/client';

// Default select for Notifications
export const NotificationDefaultArgs = Prisma.validator<Prisma.NotificationDefaultArgs>()({
  select: {
    id: true,
    type: true,
    body: true,
    createdAt: true,
    updatedAt: true,
    tenantId: true,
    recipients: {
      select: {
        userTenantId: true,
        readAt: true,
      },
    },
  },
});

export type NotificationDbType = Prisma.NotificationGetPayload<typeof NotificationDefaultArgs>;
