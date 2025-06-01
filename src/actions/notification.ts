'use server';

import { cookies } from 'next/headers';
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

import { NewNotificationType } from '@/types/notification';
import { NotificationDbType, NotificationDefaultArgs } from '@/types/prisma/notification';
import { UserNotFoundErr } from '@/lib/error';

type NotificationRecipient = {
  tenantId: string;
} & NotificationDbType['recipients'][number];

function getBaseUrl() {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

async function getCookies() {
  const _cookies = await cookies();
  return _cookies?.toString() ?? '';
}

/**
 * Creates a notification and assigns recipients.
 * If no recipients are provided, the notification is sent to all active users in the tenant.
 */
export const createNotification = async (notification: NewNotificationType) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  // Validate required fields
  if (!notification.tenantId || !notification.body.type || !notification.body.data) {
    throw new Error('Missing required notification fields');
  }

  // Prepare recipients
  let recipients: NotificationRecipient[] = Array.isArray(notification.recipients)
    ? notification.recipients.map((recipient) => ({
        tenantId: notification.tenantId,
        userTenantId: recipient.userTenantId,
        readAt: recipient.readAt || null,
      }))
    : [];

  // If no recipients, send to all active users in the tenant
  if (recipients.length === 0) {
    const userTenants = await db.userTenant.findMany({
      where: { tenantId: notification.tenantId, isActive: true },
      select: { id: true },
    });

    recipients = userTenants.map((userTenant) => ({
      tenantId: notification.tenantId,
      userTenantId: userTenant.id,
      readAt: null,
    }));
  }

  // Create notification with recipients
  try {
    return await db.notification.create({
      data: {
        tenantId: notification.tenantId,
        type: notification.body.type,
        body: JSON.stringify(notification.body),
        recipients: {
          create: recipients,
        },
      },
      select: NotificationDefaultArgs.select,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw new Error('Failed to create notification');
  }
};

export const publishNotification = async (notification: NewNotificationType) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  if (!notification.tenantId || !notification.body.type || !notification.body.data) {
    throw new Error('Missing required notification fields');
  }

  try {
    const createdNotification = await createNotification(notification);
    // Publish the notification to the Ably channel
    fetch(`${getBaseUrl()}/api/ably/publish`, {
      method: 'POST',
      headers: {
        Cookie: await getCookies(), // Forward cookies to the API
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: `notifications:${notification.tenantId}`,
        data: notification,
      }),
    });
    return createdNotification;
  } catch (error) {
    console.error('Error publishing notification:', error);
    throw new Error('Failed to publish notification');
  }
};

export const deleteNotification = async (tenantId: string, userTenantId: string, notificationId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  // Validate required parameters
  if (!tenantId) {
    throw new Error('Tenant ID is required');
  }

  if (!notificationId) {
    throw new Error('Notification ID is required');
  }
  if (!userTenantId) {
    throw new Error('UserTenant ID is required');
  }

  try {
    // Remove the recipient for this user from the notification
    await db.notificationRecipient.deleteMany({
      where: { tenantId, notificationId, userTenantId },
    });

    // Check if there are any recipients left for this notification
    const remainingRecipients = await db.notificationRecipient.count({
      where: { notificationId },
    });

    // If no recipients remain, delete the notification itself
    if (remainingRecipients === 0) {
      await db.notification.delete({
        where: { id: notificationId, tenantId },
        select: NotificationDefaultArgs.select,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to delete notification:', error);
    throw new Error('Failed to delete notification');
  }
};
