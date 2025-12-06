import { FileText } from 'lucide-react';

import { cn } from './utils';

export const getFileIcon = (type: string | null | undefined, className: string = 'h-4 w-4') => {
  switch (type) {
    case 'pdf':
      return <FileText className={cn(className, 'text-red-500')} />;
    case 'docx':
    case 'doc':
      return <FileText className={cn(className, 'text-blue-500')} />;
    case 'xlsx':
    case 'xls':
      return <FileText className={cn(className, 'text-green-500')} />;
    case 'pptx':
    case 'ppt':
      return <FileText className={cn(className, 'text-orange-500')} />;
    default:
      return <FileText className={cn(className, 'text-gray-500')} />;
  }
};

/**
 * Maps file extension to MIME type for file input accept attribute
 */
export const getMimeTypeForExtension = (extension: string): string | undefined => {
  const ext = extension.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
    xml: 'application/xml',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  };
  return mimeTypes[ext];
};

/**
 * Gets accept prop for file input based on expected file type
 */
export const getAcceptForFileType = (expectedFileType: string | null | undefined): { [key: string]: string[] } | undefined => {
  if (!expectedFileType) return undefined;
  const mimeType = getMimeTypeForExtension(expectedFileType);
  if (!mimeType) return undefined;
  return { [mimeType]: [] };
};

export const downloadFile = async (url: string, filename: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const urlObject = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = urlObject;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(urlObject);
};
