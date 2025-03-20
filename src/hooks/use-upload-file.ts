import { useState, useTransition } from 'react';
import type { UploadedFile } from '@/types';
import { toast } from 'sonner';
import type { AnyFileRoute, UploadFilesOptions } from 'uploadthing/types';

import { getErrorMessage } from '@/lib/handle-error';
import { uploadFiles } from '@/lib/uploadthing';
import { OurFileRouter } from '@/app/api/uploadthing/core';

interface UseUploadFileOptions<TFileRoute extends AnyFileRoute> extends Pick<UploadFilesOptions<TFileRoute>, 'headers' | 'onUploadBegin' | 'onUploadProgress' | 'skipPolling'> {
  defaultUploadedFiles?: UploadedFile[];
}

export function useUploadFile(endpoint: keyof OurFileRouter, { defaultUploadedFiles = [], ...props }: UseUploadFileOptions<OurFileRouter[keyof OurFileRouter]> = {}) {
  const [isUploading, startTransition] = useTransition();
  const [progresses, setProgresses] = useState<Record<string, number>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(defaultUploadedFiles);

  async function onUpload(files: File[]) {
    startTransition(async () => {
      try {
        const res = await uploadFiles(endpoint, {
          ...props,
          files,
          onUploadProgress: ({ file, progress }) => {
            setProgresses((prev) => {
              return {
                ...prev,
                [file.name]: progress,
              };
            });
          },
        });

        setUploadedFiles((prev) => (prev ? [...prev, ...res] : res));
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setProgresses({});
      }
    });
  }

  return {
    onUpload,
    uploadedFiles,
    progresses,
    isUploading,
  };
}
