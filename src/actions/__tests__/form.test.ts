// __tests__/formActions.test.ts
import { CreateForm, GetFormById, getFormsAsOptions, GetFormStats, SubmitForm } from '@/actions/form';
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';
import { formSchemaType } from '@/services/schemas/form';

import { UserNotFoundErr } from '@/lib/error';

// Mock external dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

jest.mock('better-auth', () => ({
  openAPI: jest.fn(),
  organization: jest.fn(),
  phoneNumber: jest.fn(),
  twoFactor: jest.fn(),
  username: jest.fn(),
}));

jest.mock('uncrypto', () => ({
  getRandomValues: jest.fn(),
  randomUUID: jest.fn(),
  subtle: jest.fn(),
}));

jest.mock('@/server/db-server', () => ({
  db: {
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
  },
}));

const mockSession = { user: { id: 'user-123' }, tenantId: 'tenant-123' };

describe('Authentication Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
  });

  test('should return formatted form options', async () => {
    const mockForms = [
      { id: 'form-1', name: 'Form 1' },
      { id: 'form-2', name: 'Form 2' },
    ];
    (db.form.findMany as jest.Mock).mockResolvedValueOnce(mockForms);

    const result = await getFormsAsOptions('tenant-123');

    expect(result).toEqual([
      { value: 'form-1', label: 'Form 1' },
      { value: 'form-2', label: 'Form 2' },
    ]);
    expect(db.form.findMany).toHaveBeenCalledWith({
      select: { id: true, name: true },
      where: { tenantId: 'tenant-123' },
    });
  });
});

describe('GetFormStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
  });

  test('should calculate correct form stats', async () => {
    (db.form.aggregate as jest.Mock).mockResolvedValueOnce({
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
    (db.form.aggregate as jest.Mock).mockResolvedValueOnce({
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
  });

  test('should create form with valid data', async () => {
    (db.form.create as jest.Mock).mockResolvedValueOnce({ id: 'new-form-123' });

    const result = await CreateForm(validFormData, 'tenant-123');
    expect(result).toBe('new-form-123');
    expect(db.form.create).toHaveBeenCalledWith({
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
  });

  test('should retrieve form by ID', async () => {
    const mockForm = { id: 'form-123', name: 'Test Form' };
    (db.form.findUnique as jest.Mock).mockResolvedValueOnce(mockForm);

    const result = await GetFormById('form-123', 'tenant-123');
    expect(result).toEqual(mockForm);
    expect(db.form.findUnique).toHaveBeenCalledWith({
      where: { id: 'form-123', tenantId: 'tenant-123' },
    });
  });

  test('should return null when form is not found', async () => {
    (db.form.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const result = await GetFormById('non-existent-form', 'tenant-123');
    expect(result).toBeNull();
  });

  test('should throw error when database query fails', async () => {
    const dbError = new Error('Database connection failed');
    (db.form.findUnique as jest.Mock).mockRejectedValueOnce(dbError);

    await expect(GetFormById('form-123', 'tenant-123')).rejects.toThrow('Database connection failed');
  });
});

describe('SubmitForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
  });

  test('should handle valid form submission', async () => {
    const validContent = { field1: 'value1', field2: 'value2' };
    (db.form.update as jest.Mock).mockResolvedValueOnce({});

    await SubmitForm('tenant-123', 'form-123', validContent);

    expect(db.form.update).toHaveBeenCalledWith({
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
    (db.form.update as jest.Mock).mockResolvedValueOnce({});

    await SubmitForm('tenant-123', 'form-123', emptyContent);

    expect(db.form.update).toHaveBeenCalledWith({
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
    (db.form.update as jest.Mock).mockRejectedValueOnce(dbError);

    await expect(SubmitForm('tenant-123', 'form-123', validContent)).rejects.toThrow('Failed to submit form');
  });
});

// Add similar test suites for other functions (PublishForm, GetFormContentByUrl, etc.)
