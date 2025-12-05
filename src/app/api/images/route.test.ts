/**
 * @jest-environment node
 */

import { v2 as cloudinary } from 'cloudinary';

import { GET, POST } from './route';

type UploadResponseCallback = (error: Error | null, result: unknown) => void;
type UploadStream = { end: (buffer: Buffer) => void };

// Mock cloudinary
jest.mock('cloudinary', () => {
  const mockSearch = {
    expression: jest.fn().mockReturnThis(),
    sort_by: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };
  return {
    v2: {
      config: jest.fn(),
      search: mockSearch,
      uploader: {
        upload_stream: jest.fn().mockImplementation((callback?: UploadResponseCallback) => {
          if (callback) callback(null, {});
          return {
            end: jest.fn(),
          } as UploadStream;
        }),
      },
    },
  };
});

describe('Images API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/images', () => {
    it('returns list of images', async () => {
      const mockResources = [
        {
          public_id: 'image1',
          secure_url: 'https://example.com/image1.jpg',
          created_at: '2024-01-01',
          bytes: 1000,
          format: 'jpg',
          width: 800,
          height: 600,
        },
      ];

      // @ts-expect-error - Mock implementation of Cloudinary search API
      jest.spyOn(cloudinary.search, 'execute').mockResolvedValue({ resources: mockResources });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([
        {
          id: 'image1',
          url: 'https://example.com/image1.jpg',
          created_at: '2024-01-01',
          bytes: 1000,
          format: 'jpg',
          display_name: 'image1',
          width: 800,
          height: 600,
        },
      ]);
    });

    it('handles errors when fetching images', async () => {
      // @ts-expect-error - Mock implementation of Cloudinary search API error case
      jest.spyOn(cloudinary.search, 'execute').mockRejectedValue(new Error('Cloudinary error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch images' });
    });
  });

  describe('POST /api/images', () => {
    it('uploads image successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResult = {
        public_id: 'test',
        secure_url: 'https://example.com/test.jpg',
        created_at: '2024-01-01',
        bytes: 1000,
        format: 'jpg',
        width: 800,
        height: 600,
      };

      // @ts-expect-error - Mock implementation of Cloudinary upload stream
      jest.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation((options, callback) => {
        callback(null, mockResult);
        return { end: jest.fn() };
      });

      const formData = new FormData();
      formData.append('file', mockFile);

      const request = new Request('http://localhost:3000/api/images', {
        method: 'POST',
        body: formData,
      });

      const response = (await POST(request)) as Response;
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        id: 'test',
        url: 'https://example.com/test.jpg',
        created_at: '2024-01-01',
        bytes: 1000,
        format: 'jpg',
        display_name: 'test',
        width: 800,
        height: 600,
      });
    });

    it('returns 400 when no file is provided', async () => {
      const formData = new FormData();
      const request = new Request('http://localhost:3000/api/images', {
        method: 'POST',
        body: formData,
      });

      const response = (await POST(request)) as Response;
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'No file provided' });
    });

    it('handles upload errors', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      // @ts-expect-error - Mock implementation of Cloudinary upload stream error case
      jest.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation((options, callback) => {
        callback(new Error('Upload error'), null);
        return { end: jest.fn() };
      });

      const formData = new FormData();
      formData.append('file', mockFile);

      const request = new Request('http://localhost:3000/api/images', {
        method: 'POST',
        body: formData,
      });

      const response = (await POST(request)) as Response;
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to upload file' });
    });
  });
});
