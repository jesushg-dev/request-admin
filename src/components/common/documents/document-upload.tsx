'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getPathname } from '@/i18n/routing';
import { useDocumentUploadSchema, type TDocumentUploadSchema } from '@/services/schemas/documents';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Locale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { useUploadThing } from '@/lib/uploadthing';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ButtonLoading } from '@/components/shared/button-util';
import { FileUploader } from '@/components/uploader/file-uploader';

type FormValues = TDocumentUploadSchema;

interface DocumentUploadProps {
  id?: string;
  locale: Locale;
  tenantId: string;
  folderId?: string | null;
  dataroomId?: string | null;
  callbackUrl: string | null;
}

export function DocumentUpload({ id, locale, tenantId, folderId, callbackUrl, dataroomId }: DocumentUploadProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('admin.upload');
  const [pending, startTransition] = useTransition();
  const [progresses, setProgresses] = useState<Record<string, number>>({});

  const documentUploadSchema = useDocumentUploadSchema();

  const form = useForm<FormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: [],
    },
  });

  const { startUpload, isUploading } = useUploadThing('imageUploader', {
    onClientUploadComplete: (res) => {
      // Set all files to 100% on completion
      const completedProgresses: Record<string, number> = {};
      const files = form.getValues('files') || [];
      files.forEach((file) => {
        completedProgresses[file.name] = 100;
      });
      setProgresses(completedProgresses);
      // Clear after a brief delay to show completion
      setTimeout(() => setProgresses({}), 500);
    },
    onUploadError: (error) => {
      toast.error(t('errors.uploadError', { message: error.message }));
      setProgresses({});
    },
    onUploadProgress: (progress) => {
      // progress is a number from 0 to 100 representing the average progress of all files
      const files = form.getValues('files') || [];
      const newProgresses: Record<string, number> = {};
      files.forEach((file) => {
        newProgresses[file.name] = progress;
      });
      setProgresses(newProgresses);
    },
    onUploadBegin: (fileName) => {
      // Initialize progress for the file that just started uploading
      // fileName is a string (the name of the file)
      setProgresses((prev) => ({
        ...prev,
        [fileName]: 0,
      }));
    },
  });

  const onSubmit = async (newData: FormValues) => {
    if (!newData.files || newData.files.length === 0) {
      toast.error(t('errors.selectFile'));
      return;
    }

    startTransition(async () => {
      const toastId = toast.loading(t('toast.uploading'));
      
      try {
        // Initialize progress for all files
        const initialProgresses: Record<string, number> = {};
        newData.files.forEach((file) => {
          initialProgresses[file.name] = 0;
        });
        setProgresses(initialProgresses);

        // Upload files with proper input structure
        // tenantId is required by the schema, so we always need to send it
        // Progress updates are handled by onUploadProgress callback
        const uploadedFiles = await startUpload(
          newData.files,
          {
            tenantId,
            folderId: folderId ?? undefined,
            dataroomId: dataroomId ?? undefined,
          } as any
        );

        if (!uploadedFiles || uploadedFiles.length === 0) {
          throw new Error(t('errors.uploadFailed'));
        }

        // Invalidate document queries to refresh the list
        // ZenStack query keys follow the pattern: ["zenstack", model, operation, args, options]
        queryClient.invalidateQueries({ queryKey: ['zenstack', 'Document', 'findMany'] });
        // Also invalidate dataroom folder queries if we're in a dataroom context
        if (dataroomId) {
          queryClient.invalidateQueries({ queryKey: ['zenstack', 'DataroomFolder', 'findMany'] });
        }

        const pathname = callbackUrl ? callbackUrl : getPathname({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/documents', params: { tenantId } } });
        router.push(pathname);
        toast.success(t('toast.success'), { id: toastId });
      } catch (error) {
        setProgresses({});
        
        // Log error for debugging
        console.error('Upload error:', error);
        
        if (error instanceof Error) {
          toast.error(t('toast.error', { message: error.message }), { id: toastId });
        } else {
          toast.error(t('errors.unknownError'), { id: toastId });
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="flex flex-1 flex-col justify-between overflow-hidden px-1 gap-4">
            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <div className="space-y-6">
                  <FormItem className="w-full">
                    <FormLabel>{t('files.label')}</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={field.value}
                        onValueChange={field.onChange}
                        maxFileCount={id ? 1 : 3}
                        maxSize={4 * 1024 * 1024}
                        progresses={progresses}
                        disabled={pending || isUploading}
                      />
                    </FormControl>
                    <FormDescription>{t('files.maxSize')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            {/*<FormField
          control={form.control}
          name="storageType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select storage type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="VERCEL_BLOB">Vercel Blob</SelectItem>
                  <SelectItem value="S3_PATH">Amazon S3</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Choose the storage type for the document</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />*/}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <ButtonLoading type="submit" isLoading={pending || isUploading}>
            {pending || isUploading ? t('button.uploading') : t('button.uploadDocument')}
          </ButtonLoading>
        </div>
      </form>
    </Form>
  );
}
