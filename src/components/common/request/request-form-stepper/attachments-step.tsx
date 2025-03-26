'use client';

import { CloudUploadIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertBanner } from '@/components/custom-ui/alert-banner';
import { FileUploader } from '@/components/uploader/file-uploader';

export const attachmentSchema = z.object({
  additionalDocuments: z.array(z.instanceof(File)).optional(),
});

export type AttachmentsValues = z.infer<typeof attachmentSchema>;

export const getDefaultAttachmentsValues = (): AttachmentsValues => ({
  additionalDocuments: [],
});

export default function AttachmentsStep() {
  const { control } = useFormContext<AttachmentsValues>();

  return (
    <>
      <AlertBanner
        variant="warning"
        title="Subir archivos"
        description={
          <div className="space-y-2">
            <p>
              Solo podrá subir <span className="font-semibold">nuevos archivos</span> en esta sección y estos serán <span className="font-semibold">guardados con la solicitud</span>.
            </p>
            <p>
              Si desea <span className="font-semibold">modificar archivos ya existentes</span>, podrá hacerlo en la sección de <span className="text-blue-500">archivos adjuntos</span> o en el{' '}
              <span className="text-blue-500">dataroom generado con la solicitud</span>.
            </p>
          </div>
        }
        icon={<CloudUploadIcon className="h-5 w-5 text-yellow-500" />}
      />

      <FormField
        control={control}
        name="additionalDocuments"
        render={({ field }) => (
          <FormItem className="flex-1 flex flex-col">
            <FormLabel>Images</FormLabel>
            <FormControl className="flex-1">
              <FileUploader horizontal value={field.value} onValueChange={field.onChange} maxFileCount={4} maxSize={4 * 1024 * 1024} />
            </FormControl>
            <FormDescription>Max file size: 4MB</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
