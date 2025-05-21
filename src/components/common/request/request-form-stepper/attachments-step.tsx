'use client';

import { CloudUploadIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertBanner } from '@/components/custom-ui/alert-banner';
import { FormSection } from '@/components/shared/form-root';
import { FileUploader } from '@/components/uploader/file-uploader';

export const attachmentSchema = z.object({
  additionalDocuments: z.array(z.instanceof(File)).optional(),
});

export type AttachmentsValues = z.infer<typeof attachmentSchema>;

export const getDefaultAttachmentsValues = (): AttachmentsValues => ({
  additionalDocuments: [],
});

export default function AttachmentsStep() {
  const t = useTranslations('admin.request.form.attachmentsStep');
  const { control } = useFormContext<AttachmentsValues>();

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('attachmentStep')}</CardTitle>
        <CardDescription>{t('attachmentStepDescription')}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
        <ScrollArea className="flex-1">
          <FormSection className="px-1 flex flex-col gap-2">
            <AlertBanner
              variant="warning"
              title={t('uploadFiles')}
              description={
                <div className="space-y-2">
                  <p>
                    {t.rich('uploadNewFiles', {
                      strong: (chunks) => <span className="font-semibold">{chunks}</span>,
                    })}
                  </p>
                  <p>
                    {t.rich('modifyExistingFiles', {
                      strong: (chunks) => <span className="font-semibold">{chunks}</span>,
                      link: (chunks) => <span className="text-blue-500">{chunks}</span>,
                    })}
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
                  <FormLabel>{t('images')}</FormLabel>
                  <FormControl className="flex-1">
                    <FileUploader horizontal value={field.value} onValueChange={field.onChange} maxFileCount={4} maxSize={4 * 1024 * 1024} />
                  </FormControl>
                  <FormDescription>{t('maxFileSize')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
