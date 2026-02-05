// __tests__/formActions.test.ts
import { CreateForm, GetFormById, GetFormContentById, GetFormContentByUrl, GetForms, getFormsAsOptions, GetFormStats, PublishForm, SubmitForm, UpdateFormContent } from '@/actions/form';
import { currentSession, requireUser } from '@/server/auth-server';
import { getDb } from '@/server/db-client';
import { formSchemaType } from '@/services/schemas/form';

import { UserNotFoundErr } from '@/lib/error';

// Mock external dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
  requireUser: jest.fn(),
}));

jest.mock('better-auth', () => ({
  openAPI: jest.fn(),
  organization: jest.fn(),
  phoneNumber: jest.fn(),
  twoFactor: jest.fn(),
  username: jest.fn(),
}));

const mockDb = {
  form: {
    findMany: jest.fn(),
    aggregate: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  formSubmission: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  formKey: {
    createMany: jest.fn(),
  },
  userTenant: {
    findUnique: jest.fn().mockResolvedValue({
      id: 'user-tenant-1',
      userRoles: [
        {
          role: {
            roleFeature: [{ feature: { key: 'form_create' } }, { feature: { key: 'form_edit' } }, { feature: { key: 'form_publish' } }],
          },
        },
      ],
      userAreas: [],
    }),
  },
};

jest.mock('@/server/db-client', () => ({
  getDb: jest.fn(),
}));

const mockSession = { user: { id: 'user-123' }, tenantId: 'tenant-123' };

describe('Authentication Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  test('should throw UserNotFoundErr when no session exists', async () => {
    (currentSession as jest.Mock).mockResolvedValueOnce(null);

    await expect(getFormsAsOptions('tenant-123')).rejects.toThrow(UserNotFoundErr);
    await expect(GetFormStats('tenant-123')).rejects.toThrow(UserNotFoundErr);
    await expect(CreateForm({} as formSchemaType, 'tenant-123')).rejects.toThrow(UserNotFoundErr);
  });
});

describe('getFormsAsOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  test('should return formatted form options', async () => {
    const mockForms = [
      { id: 'form-1', name: 'Form 1' },
      { id: 'form-2', name: 'Form 2' },
    ];
    (mockDb.form.findMany as jest.Mock).mockResolvedValueOnce(mockForms);

    const result = await getFormsAsOptions('tenant-123');

    expect(result).toEqual([
      { value: 'form-1', label: 'Form 1' },
      { value: 'form-2', label: 'Form 2' },
    ]);
    expect(mockDb.form.findMany).toHaveBeenCalledWith({
      select: { id: true, name: true },
      where: { tenantId: 'tenant-123' },
    });
  });
});

describe('GetFormStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
    (requireUser as jest.Mock).mockImplementation(async () => {
      const s = await (currentSession as any)();
      return s?.user ?? s;
    });
  });

  test('should calculate correct form stats', async () => {
    (mockDb.form.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { visits: 100, submissions: 25 },
    });

    const result = await GetFormStats('tenant-123');

    expect(result).toEqual({
      visits: 100,
      submissions: 25,
      submissionRate: 25,
      bounceRate: 75,
    });
  });

  test('should handle zero visits', async () => {
    (mockDb.form.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { visits: 0, submissions: 0 },
    });

    const result = await GetFormStats('tenant-123');
    expect(result.submissionRate).toBe(0);
    expect(result.bounceRate).toBe(100);
  });
});

describe('CreateForm', () => {
  const validFormData = {
    name: 'Test Form',
    description: 'Test Description',
    isPublic: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
    (requireUser as jest.Mock).mockImplementation(async () => {
      const s = await (currentSession as any)();
      return s?.user ?? s;
    });
  });

  test('should create form with valid data', async () => {
    (mockDb.form.create as jest.Mock).mockResolvedValueOnce({ id: 'new-form-123' });

    const result = await CreateForm(validFormData, 'tenant-123');
    expect(result).toBe('new-form-123');
    expect(mockDb.form.create).toHaveBeenCalledWith({
      data: {
        ...validFormData,
        tenantId: 'tenant-123',
      },
    });
  });

  test('should throw error for invalid form data', async () => {
    const invalidData = {
      name: 'abc', // Less than 4 characters
      description: 123, // Wrong type
      isPublic: 'true', // Wrong type
    } as unknown as formSchemaType;

    await expect(CreateForm(invalidData, 'tenant-123')).rejects.toThrow('form not valid');
  });
});

describe('GetFormById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
    (requireUser as jest.Mock).mockImplementation(async () => {
      const s = await (currentSession as any)();
      return s?.user ?? s;
    });
  });

  test('should retrieve form by ID', async () => {
    const mockForm = { id: 'form-123', name: 'Test Form' };
    (mockDb.form.findUnique as jest.Mock).mockResolvedValueOnce(mockForm);

    const result = await GetFormById('form-123', 'tenant-123');
    expect(result).toEqual(mockForm);
    expect(mockDb.form.findUnique).toHaveBeenCalledWith({
      where: { id: 'form-123', tenantId: 'tenant-123' },
    });
  });

  test('should return null when form is not found', async () => {
    (mockDb.form.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const result = await GetFormById('non-existent-form', 'tenant-123');
    expect(result).toBeNull();
  });

  test('should throw error when database query fails', async () => {
    const dbError = new Error('Database connection failed');
    (mockDb.form.findUnique as jest.Mock).mockRejectedValueOnce(dbError);

    await expect(GetFormById('form-123', 'tenant-123')).rejects.toThrow('Database connection failed');
  });
});

describe('SubmitForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
    (requireUser as jest.Mock).mockImplementation(async () => {
      const s = await (currentSession as any)();
      return s?.user ?? s;
    });
  });

  test('should handle valid form submission', async () => {
    const validContent = { field1: 'value1', field2: 'value2' };
    (mockDb.form.update as jest.Mock).mockResolvedValueOnce({});

    await SubmitForm('tenant-123', 'form-123', validContent);

    expect(mockDb.form.update).toHaveBeenCalledWith({
      where: { id: 'form-123', published: true },
      data: {
        submissions: { increment: 1 },
        formSubmissions: {
          create: [
            {
              content: JSON.stringify(validContent),
              tenantId: 'tenant-123',
              keys: {
                createMany: {
                  data: [
                    { key: 'field1', value: 'value1', tenantId: 'tenant-123' },
                    { key: 'field2', value: 'value2', tenantId: 'tenant-123' },
                  ],
                },
              },
            },
          ],
        },
      },
    });
  });

  test('should handle empty form submission', async () => {
    const emptyContent = {};
    (mockDb.form.update as jest.Mock).mockResolvedValueOnce({});

    await SubmitForm('tenant-123', 'form-123', emptyContent);

    expect(mockDb.form.update).toHaveBeenCalledWith({
      where: { id: 'form-123', published: true },
      data: {
        submissions: { increment: 1 },
        formSubmissions: {
          create: [
            {
              content: JSON.stringify(emptyContent),
              tenantId: 'tenant-123',
              keys: {
                createMany: {
                  data: [],
                },
              },
            },
          ],
        },
      },
    });
  });

  test('should throw error when form submission fails', async () => {
    const validContent = { field1: 'value1' };
    const dbError = new Error('Failed to submit form');
    (mockDb.form.update as jest.Mock).mockRejectedValueOnce(dbError);

    await expect(SubmitForm('tenant-123', 'form-123', validContent)).rejects.toThrow('Failed to submit form');
  });
});

describe('GetForms', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
  });

  test('should retrieve all forms for tenant', async () => {
    const mockForms = [
      { id: 'form-1', name: 'Form 1', createdAt: new Date('2023-01-01') },
      { id: 'form-2', name: 'Form 2', createdAt: new Date('2023-01-02') },
    ];
    (mockDb.form.findMany as jest.Mock).mockResolvedValueOnce(mockForms);

    const result = await GetForms('tenant-123');

    expect(result).toEqual(mockForms);
    expect(mockDb.form.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-123' },
      orderBy: { createdAt: 'desc' },
    });
  });

  test('should return empty array when no forms exist', async () => {
    (mockDb.form.findMany as jest.Mock).mockResolvedValueOnce([]);

    const result = await GetForms('tenant-123');
    expect(result).toEqual([]);
  });

  test('should throw error when database query fails', async () => {
    const dbError = new Error('Database connection failed');
    (mockDb.form.findMany as jest.Mock).mockRejectedValueOnce(dbError);

    await expect(GetForms('tenant-123')).rejects.toThrow('Database connection failed');
  });
});

describe('UpdateFormContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
  });

  test('should update form content successfully', async () => {
    const jsonContent = '{"fields": [{"type": "text", "label": "Name"}]}';
    const mockUpdatedForm = { id: 'form-123', content: jsonContent };
    (mockDb.form.update as jest.Mock).mockResolvedValueOnce(mockUpdatedForm);

    const result = await UpdateFormContent('form-123', jsonContent, 'tenant-123');

    expect(result).toEqual(mockUpdatedForm);
    expect(mockDb.form.update).toHaveBeenCalledWith({
      where: { id: 'form-123', tenantId: 'tenant-123' },
      data: { content: jsonContent },
    });
  });

  test('should throw error when database update fails', async () => {
    const jsonContent = '{"fields": []}';
    const dbError = new Error('Update failed');
    (mockDb.form.update as jest.Mock).mockRejectedValueOnce(dbError);

    await expect(UpdateFormContent('form-123', jsonContent, 'tenant-123')).rejects.toThrow('Update failed');
  });
});

describe('PublishForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
  });

  test('should publish form successfully', async () => {
    const mockPublishedForm = { id: 'form-123', published: true };
    (mockDb.form.update as jest.Mock).mockResolvedValueOnce(mockPublishedForm);

    const result = await PublishForm('form-123', 'tenant-123');

    expect(result).toEqual(mockPublishedForm);
    expect(mockDb.form.update).toHaveBeenCalledWith({
      data: { published: true },
      where: { tenantId: 'tenant-123', id: 'form-123' },
    });
  });

  test('should throw error when database update fails', async () => {
    const dbError = new Error('Publish failed');
    (mockDb.form.update as jest.Mock).mockRejectedValueOnce(dbError);

    await expect(PublishForm('form-123', 'tenant-123')).rejects.toThrow('Publish failed');
  });
});

describe('GetFormContentByUrl', () => {
  test('should retrieve form content by URL and increment visits', async () => {
    const mockForm = {
      id: 'form-123',
      name: 'Test Form',
      content: '{"fields": []}',
    };
    (mockDb.form.update as jest.Mock).mockResolvedValueOnce(mockForm);

    const result = await GetFormContentByUrl('test-form-url', 'tenant-123');

    expect(result).toEqual(mockForm);
    expect(mockDb.form.update).toHaveBeenCalledWith({
      select: { id: true, name: true, content: true },
      data: { visits: { increment: 1 } },
      where: {
        tenantId: 'tenant-123',
        shareURL: 'test-form-url',
        published: true,
        isPublic: true,
      },
    });
  });

  test('should return null when form not found by URL', async () => {
    (mockDb.form.update as jest.Mock).mockResolvedValueOnce(null);

    const result = await GetFormContentByUrl('non-existent-url', 'tenant-123');
    expect(result).toBeNull();
  });

  test('should throw error when database query fails', async () => {
    const dbError = new Error('Database error');
    (mockDb.form.update as jest.Mock).mockRejectedValueOnce(dbError);

    await expect(GetFormContentByUrl('test-url', 'tenant-123')).rejects.toThrow('Database error');
  });
});

describe('GetFormContentById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
  });

  test('should retrieve form content by ID and increment visits', async () => {
    const mockForm = {
      id: 'form-123',
      name: 'Test Form',
      description: 'Test Description',
      content: '{"fields": []}',
    };
    (mockDb.form.update as jest.Mock).mockResolvedValueOnce(mockForm);

    const result = await GetFormContentById('form-123', 'tenant-123');

    expect(result).toEqual(mockForm);
    expect(mockDb.form.update).toHaveBeenCalledWith({
      select: { id: true, name: true, description: true, content: true },
      data: { visits: { increment: 1 } },
      where: { tenantId: 'tenant-123', id: 'form-123', published: true },
    });
  });

  test('should return null when form not found by ID', async () => {
    (mockDb.form.update as jest.Mock).mockResolvedValueOnce(null);

    const result = await GetFormContentById('non-existent-id', 'tenant-123');
    expect(result).toBeNull();
  });

  test('should throw error when database query fails', async () => {
    const dbError = new Error('Database error');
    (mockDb.form.update as jest.Mock).mockRejectedValueOnce(dbError);

    await expect(GetFormContentById('form-123', 'tenant-123')).rejects.toThrow('Database error');
  });
});
