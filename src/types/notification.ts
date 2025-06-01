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

// Type for creating a new notification (business payload)
export type NewNotificationType = {
  tenantId: string;
  body: NotificationBody;
  recipients: {
    userTenantId: string;
    readAt: Date | null;
  }[];
};
