import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Small helper around local filesystem storage.
 * Files are stored under `public/uploads`.
 */

const UPLOAD_ROOT_DIR = path.join(process.cwd(), 'public', 'uploads');

export interface LocalStoredFile {
  relativePath: string;
  url: string;
  size: number;
  contentType: string | null;
  originalName: string;
}

export async function ensureUploadDir(subDir: string[]): Promise<string> {
  const fullPath = path.join(UPLOAD_ROOT_DIR, ...subDir);
  await fs.mkdir(fullPath, { recursive: true });
  return fullPath;
}

export async function saveBufferToLocalFile(options: { buffer: Buffer; tenantId: string; originalName: string; contentType?: string | null }): Promise<LocalStoredFile> {
  const { buffer, tenantId, originalName, contentType } = options;

  const safeTenantId = tenantId || 'unknown';
  const ext = path.extname(originalName) || '';
  const baseName = path.basename(originalName, ext);
  const uniqueName = `${baseName}-${randomUUID()}${ext}`;

  const dir = await ensureUploadDir([safeTenantId]);
  const fullPath = path.join(dir, uniqueName);

  await fs.writeFile(fullPath, buffer);

  // public/ is the web root, so everything after it becomes the URL path
  const relativePath = path.join('uploads', safeTenantId, uniqueName).replace(/\\/g, '/');

  return {
    relativePath,
    url: `/${relativePath}`,
    size: buffer.byteLength,
    contentType: contentType ?? null,
    originalName,
  };
}
