// Import after ALL mocks
import { createNotification, deleteNotification, sendEmailNotification, sendSMSNotification, sendWhatsAppNotification } from '@/actions/notification';
import { currentSession } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { NotificationTypeEnum } from '@/types/notification';
import { sendNotificationEmail } from '@/lib/mail';
import { sendSMS, sendWhatsApp } from '@/lib/twilio';

// Mock ALL external dependencies BEFORE any imports
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    toString: jest.fn().mockReturnValue('mock-cookies'),
  }),
}));

jest.mock('@/lib/notification-templates', () => ({
  getNotificationTemplate: jest.fn().mockReturnValue('Test message'),
}));

jest.mock('@/lib/twilio', () => ({
  sendSMS: jest.fn().mockResolvedValue({ success: true }),
  sendWhatsApp: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('@/lib/mail', () => ({
  sendNotificationEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/env', () => ({
  env: {
    APP_NAME: 'Test App',
    AUTH_SECRET: 'test-secret',
    BETTER_AUTH_URL: 'http://localhost:3000',
    BETTER_AUTH_SECRET: 'test-auth-secret',
    RESEND_API_KEY: 'test-resend-key',
    TWILIO_ACCOUNT_SID: 'test-twilio-sid',
    TWILIO_AUTH_TOKEN: 'test-twilio-token',
    TWILIO_PHONE_NUMBER: '+1234567890',
    ABLY_API_KEY: 'test-ably-key',
  },
}));

const mockDb = {
  notification: {
    create: jest.fn().mockResolvedValue({
      id: 'notification-1',
      tenantId: 'tenant-1',
      type: 'ASSIGNMENT',
      body: '{"type":"ASSIGNMENT","data":{"requestId":"req-1","assigneeId":"user-1"}}',
    }),
    findMany: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({ id: 'notification-1' }),
  },
  notificationRecipient: {
    create: jest.fn().mockResolvedValue({
      id: 'recipient-1',
      notificationId: 'notification-1',
      userTenantId: 'user-tenant-1',
      type: 'email',
    }),
    findMany: jest.fn().mockResolvedValue([]),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    count: jest.fn().mockResolvedValue(1),
  },
  userTenant: {
    findMany: jest.fn().mockResolvedValue([{ id: 'user-tenant-1' }, { id: 'user-tenant-2' }]),
  },
};

jest.mock('@/server/db-client', () => ({
  getDb: jest.fn(),
}));

jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn().mockResolvedValue({
    user: { id: 'user-123', isGlobalAdmin: false },
  }),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

describe('Notification Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123', isGlobalAdmin: false },
    });
    (getDb as jest.Mock).mockResolvedValue(mockDb);
    (console.error as jest.Mock).mockClear();
    (console.log as jest.Mock).mockClear();
  });

  describe('createNotification', () => {
    const mockNotification = {
      tenantId: 'tenant-1',
      body: {
        type: NotificationTypeEnum.ASSIGNMENT,
        data: { requestId: 'req-1', assigneeId: 'user-1' },
      },
      recipients: [
        { userTenantId: 'user-tenant-1', type: 'email' as const },
        { userTenantId: 'user-tenant-2', type: 'sms' as const },
      ],
    };

    it('should create notification successfully', async () => {
      const result = await createNotification(mockNotification);

      expect(result).toEqual({
        id: 'notification-1',
        tenantId: 'tenant-1',
        type: 'ASSIGNMENT',
        body: '{"type":"ASSIGNMENT","data":{"requestId":"req-1","assigneeId":"user-1"}}',
      });

      expect(mockDb.notification.create).toHaveBeenCalledWith({
        data: {
          tenantId: 'tenant-1',
          type: NotificationTypeEnum.ASSIGNMENT,
          body: JSON.stringify(mockNotification.body),
          recipients: {
            create: expect.arrayContaining([expect.objectContaining({ userTenantId: 'user-tenant-1' }), expect.objectContaining({ userTenantId: 'user-tenant-2' })]),
          },
        },
        select: expect.any(Object),
      });
    });

    it('should throw error when required fields are missing', async () => {
      const invalidNotification = {
        tenantId: '',
        body: { type: NotificationTypeEnum.ASSIGNMENT, data: { requestId: 'req-1', assigneeId: 'user-1' } },
        recipients: [],
      };

      await expect(createNotification(invalidNotification)).rejects.toThrow('Missing required notification fields');
    });

    it('should throw error when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(createNotification(mockNotification)).rejects.toThrow('User not found');
    });
  });

  describe('deleteNotification', () => {
    const mockParams = {
      tenantId: 'tenant-1',
      userTenantId: 'user-tenant-1',
      notificationId: 'notification-1',
    };

    it('should delete notification recipient successfully', async () => {
      const result = await deleteNotification(mockParams.tenantId, mockParams.userTenantId, mockParams.notificationId);

      expect(result).toEqual({ success: true });
      expect(mockDb.notificationRecipient.deleteMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', notificationId: 'notification-1', userTenantId: 'user-tenant-1' },
      });
      expect(mockDb.notificationRecipient.count).toHaveBeenCalledWith({
        where: { notificationId: 'notification-1' },
      });
    });

    it('should delete entire notification when no recipients remain', async () => {
      (mockDb.notificationRecipient.count as jest.Mock).mockResolvedValue(0);

      const result = await deleteNotification(mockParams.tenantId, mockParams.userTenantId, mockParams.notificationId);

      expect(result).toEqual({ success: true });
      expect(mockDb.notification.delete).toHaveBeenCalledWith({
        where: expect.objectContaining({ id: 'notification-1' }),
        select: expect.any(Object),
      });
    });

    it('should throw error when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(deleteNotification(mockParams.tenantId, mockParams.userTenantId, mockParams.notificationId)).rejects.toThrow('User not found');
    });
  });

  describe('sendSMSNotification', () => {
    const mockParams = {
      tenantId: 'tenant-1',
      locale: 'en' as const,
      type: NotificationTypeEnum.ASSIGNMENT,
      data: { requestId: 'req-1', assigneeId: 'user-1' },
      recipients: [{ phoneNumber: '+1234567890' }, { phoneNumber: '+0987654321' }],
    };

    it('should send SMS to all recipients successfully', async () => {
      const result = await sendSMSNotification(mockParams);

      expect(result).toEqual([
        { recipient: { phoneNumber: '+1234567890' }, success: true },
        { recipient: { phoneNumber: '+0987654321' }, success: true },
      ]);

      expect(sendSMS).toHaveBeenCalledTimes(2);
      expect(sendSMS).toHaveBeenCalledWith('+1234567890', 'Test message');
      expect(sendSMS).toHaveBeenCalledWith('+0987654321', 'Test message');
    });

    it('should handle partial failures', async () => {
      (sendSMS as jest.Mock).mockResolvedValueOnce({ success: true }).mockRejectedValueOnce(new Error('SMS failed'));

      const result = await sendSMSNotification(mockParams);

      expect(result).toEqual([
        { recipient: { phoneNumber: '+1234567890' }, success: true },
        { recipient: { phoneNumber: '+0987654321' }, success: false, error: expect.any(Error) },
      ]);
    });

    it('should throw error when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(sendSMSNotification(mockParams)).rejects.toThrow('User not found');
    });
  });

  describe('sendWhatsAppNotification', () => {
    const mockParams = {
      tenantId: 'tenant-1',
      type: NotificationTypeEnum.ASSIGNMENT,
      data: { requestId: 'req-1', assigneeId: 'user-1' },
      recipients: [
        { phoneNumber: '+1234567890', locale: 'en' as const },
        { phoneNumber: '+0987654321', locale: 'es' as const },
      ],
    };

    it('should send WhatsApp messages to all recipients successfully', async () => {
      const result = await sendWhatsAppNotification(mockParams);

      expect(result).toEqual([
        { recipient: { phoneNumber: '+1234567890', locale: 'en' }, success: true },
        { recipient: { phoneNumber: '+0987654321', locale: 'es' }, success: true },
      ]);

      expect(sendWhatsApp).toHaveBeenCalledTimes(2);
      expect(sendWhatsApp).toHaveBeenCalledWith('+1234567890', 'Test message');
      expect(sendWhatsApp).toHaveBeenCalledWith('+0987654321', 'Test message');
    });

    it('should handle partial failures', async () => {
      (sendWhatsApp as jest.Mock).mockResolvedValueOnce({ success: true }).mockRejectedValueOnce(new Error('WhatsApp failed'));

      const result = await sendWhatsAppNotification(mockParams);

      expect(result).toEqual([
        { recipient: { phoneNumber: '+1234567890', locale: 'en' }, success: true },
        { recipient: { phoneNumber: '+0987654321', locale: 'es' }, success: false, error: expect.any(Error) },
      ]);
    });

    it('should throw error when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(sendWhatsAppNotification(mockParams)).rejects.toThrow('User not found');
    });
  });

  describe('sendEmailNotification', () => {
    const mockParams = {
      tenantId: 'tenant-1',
      locale: 'en' as const,
      type: NotificationTypeEnum.ASSIGNMENT,
      data: { requestId: 'req-1', assigneeId: 'user-1' },
      recipients: [{ email: 'user1@example.com' }, { email: 'user2@example.com' }],
      subject: 'Test Subject',
    };

    it('should send email to all recipients successfully', async () => {
      const result = await sendEmailNotification(mockParams);

      expect(result).toEqual([
        { recipient: { email: 'user1@example.com' }, success: true },
        { recipient: { email: 'user2@example.com' }, success: true },
      ]);

      expect(sendNotificationEmail).toHaveBeenCalledWith(['user1@example.com', 'user2@example.com'], 'Test Subject', 'Test message');
    });

    it('should use default subject when not provided', async () => {
      const paramsWithoutSubject = { ...mockParams };
      delete (paramsWithoutSubject as { subject?: string }).subject;

      await sendEmailNotification(paramsWithoutSubject);

      expect(sendNotificationEmail).toHaveBeenCalledWith(['user1@example.com', 'user2@example.com'], 'Notification: assignment', 'Test message');
    });

    it('should throw error when email sending fails', async () => {
      (sendNotificationEmail as jest.Mock).mockRejectedValue(new Error('Email failed'));

      await expect(sendEmailNotification(mockParams)).rejects.toThrow('Failed to send email notifications');
    });

    it('should throw error when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(sendEmailNotification(mockParams)).rejects.toThrow('User not found');
    });
  });
});
