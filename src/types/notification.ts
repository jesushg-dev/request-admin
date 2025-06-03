import { type Locale } from 'next-intl';

import { NotificationDbType } from './prisma/notification';

export type NotificationDataType = NotificationDbType & {
  type: NotificationType;
};

// Enum of all possible notification types (including 'all' for filtering)
export const NotificationTypeEnum = {
  ALL: 'all',
  ASSIGNMENT: 'assignment',
  STATUS: 'status',
  COMMENT: 'comment',
  SYSTEM: 'system',
} as const;

// Type for notifications (includes 'all', for UI/filtering)
export type NotificationType = (typeof NotificationTypeEnum)[keyof typeof NotificationTypeEnum];

// Type for real notifications (excludes 'all', for business logic)
export type NotificationTypeWithoutAll = Exclude<NotificationType, 'all'>;

// Payloads for each notification type
export type AssignmentNotificationPayload = {
  requestId: string;
};

export type StatusNotificationPayload = {
  requestId: string;
  status: string;
};

export type CommentNotificationPayload = {
  requestId: string;
  commenter: string;
  comment: string;
};

export type SystemNotificationPayload = {
  message: string;
};

// Union type for the notification body
export type NotificationBody =
  | { type: typeof NotificationTypeEnum.ASSIGNMENT; data: AssignmentNotificationPayload }
  | { type: typeof NotificationTypeEnum.STATUS; data: StatusNotificationPayload }
  | { type: typeof NotificationTypeEnum.COMMENT; data: CommentNotificationPayload }
  | { type: typeof NotificationTypeEnum.SYSTEM; data: SystemNotificationPayload };

// Base types for all notifications
export type NotificationChannel = 'in_app' | 'sms' | 'whatsapp';

// Base recipient type
type BaseRecipient = {
  userTenantId: string;
  readAt?: Date | null;
};

// External notification recipient (SMS/WhatsApp)
type ExternalRecipient = BaseRecipient & {
  phoneNumber: string;
  locale: Locale;
};

// In-app notification recipient
type InAppRecipient = BaseRecipient;

// Base notification body
type BaseNotificationBody = {
  type: NotificationTypeWithoutAll;
  data: NotificationBody['data'];
};

// In-app notification
export interface InAppNotification {
  tenantId: string;
  recipients?: InAppRecipient[];
  body: BaseNotificationBody;
}

// External notification (SMS/WhatsApp)
export interface ExternalNotification {
  tenantId: string;
  recipients: ExternalRecipient[];
  body: BaseNotificationBody;
}

// Union type for all notification types
export type NewNotificationType = InAppNotification | ExternalNotification;
