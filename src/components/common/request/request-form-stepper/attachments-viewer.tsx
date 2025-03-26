'use client';

import { FileIcon, X } from 'lucide-react';

import { formatBytes } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AttachmentsViewerProps {
  files: File[];
}

export default function AttachmentsViewer({ files }: AttachmentsViewerProps) {
  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>Files to upload ({files.length})</CardTitle>
        <CardDescription>You can upload up to 4 files with a maximum size of 4MB each. Supported formats: .jpg, .png, .pdf, .docx, .xlsx.</CardDescription>
      </CardHeader>
      <CardContent>
        {files.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 lg:grid-cols-4">
            {files.map((file, index) => (
              <div key={index} className="p-4 relative">
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 z-10">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>

                {isImageFile(file) ? (
                  <div className="relative aspect-square overflow-hidden rounded-md mb-2">
                    <img src={URL.createObjectURL(file) || '/placeholder.svg'} alt={file.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center aspect-square bg-gray-100 rounded-md mb-2">
                    {file.type.includes('pdf') ? (
                      <FileIcon className="h-12 w-12 text-red-500" />
                    ) : file.type.includes('word') || file.type.includes('document') ? (
                      <FileIcon className="h-12 w-12 text-blue-500" />
                    ) : file.type.includes('spreadsheet') || file.type.includes('excel') ? (
                      <FileIcon className="h-12 w-12 text-green-500" />
                    ) : (
                      <FileIcon className="h-12 w-12 text-gray-500" />
                    )}
                  </div>
                )}
                <div className="truncate text-sm font-medium">{file.name}</div>
                <div className="text-xs text-gray-500">{formatBytes(file.size)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
