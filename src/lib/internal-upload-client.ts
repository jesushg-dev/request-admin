export interface InternalUploadParams {
  tenantId: string;
  folderId?: string | null;
  dataroomId?: string | null;
  documentId?: string | null;
  files: File[];
}

export async function uploadDocumentsInternal(params: InternalUploadParams) {
  const { tenantId, folderId, dataroomId, documentId, files } = params;

  const formData = new FormData();
  formData.append('tenantId', tenantId);
  if (folderId) formData.append('folderId', folderId);
  if (dataroomId) formData.append('dataroomId', dataroomId);
  if (documentId) formData.append('documentId', documentId);

  for (const file of files) {
    formData.append('files', file);
  }

  const res = await fetch('/api/internal-upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error uploading files');
  }

  return res.json();
}


