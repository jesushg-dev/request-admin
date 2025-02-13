'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { useUploadFile } from '@/hooks/use-upload-file';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileUploader } from '@/components/uploader/file-uploader';
import { UploadedFilesCard } from '@/components/uploader/uploaded-files-card';

export const attachmentSchema = z.object({
  additionalDocuments: z.array(z.instanceof(File)).optional(),
});

export type RequestDetailValues = z.infer<typeof attachmentSchema>;

export default function AttachmentsStep() {
  const { control } = useFormContext<RequestDetailValues>();

  const { /* uploadFiles, */ progresses, uploadedFiles, isUploading } = useUploadFile('imageUploader', { defaultUploadedFiles: [] });

  return (
    <div className="flex flex-col gap-2 mx-1 flex-1 overflow-hidden">
      <FormField
        control={control}
        name="additionalDocuments"
        render={({ field }) => (
          <div className="space-y-6">
            <FormItem className="w-full">
              <FormLabel>Images</FormLabel>
              <FormControl>
                <FileUploader
                  value={field.value}
                  onValueChange={field.onChange}
                  maxFileCount={4}
                  maxSize={4 * 1024 * 1024}
                  progresses={progresses}
                  // pass the onUpload function here for direct upload
                  // onUpload={uploadFiles}
                  disabled={isUploading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            {uploadedFiles.length > 0 ? <UploadedFilesCard uploadedFiles={uploadedFiles} /> : null}
          </div>
        )}
      />
    </div>
  );
}
