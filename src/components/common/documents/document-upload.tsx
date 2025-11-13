'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getPathname } from '@/i18n/routing';
import { useDocumentUploadSchema, type TDocumentUploadSchema } from '@/services/schemas/documents';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Locale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { uploadFiles } from '@/lib/uploadthing';
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
  const [pending, startTransition] = useTransition();
  //const [progresses, setProgresses] = useState<Record<string, number>>({});

  const documentUploadSchema = useDocumentUploadSchema();

  const form = useForm<FormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: [],
    },
  });

  const onSubmit = async (newData: FormValues) => {
    startTransition(async () => {
      const toastId = toast.loading('Uploading files to storage service');
      try {
        await uploadFiles('imageUploader', {
          files: newData.files,
          input: { tenantId, folderId, dataroomId },
          /*onUploadProgress: ({ file, progress }) => {
            setProgresses((prev) => ({ ...prev, [file.name]: progress }));
          },*/
        });

        const pathname = callbackUrl ? callbackUrl : getPathname({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/documents', params: { tenantId } } });
        router.push(pathname);
        toast.success('Document uploaded successfully', { id: toastId });
      } catch (error) {
        if (error instanceof Error) {
          toast.error('An error occurred while uploading the document: ' + error.message, { id: toastId });
        } else {
          toast.error('An unknown error occurred while uploading the document.', { id: toastId });
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
                    <FormLabel>Files</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={field.value}
                        onValueChange={field.onChange}
                        maxFileCount={id ? 1 : 3}
                        maxSize={4 * 1024 * 1024}
                        //progresses={progresses}
                        disabled={pending}
                        //onUpload={onUpload}
                      />
                    </FormControl>
                    <FormDescription>Max file size: 4MB</FormDescription>
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
          <ButtonLoading type="submit" isLoading={pending}>
            {pending ? 'Uploading...' : 'Upload Document'}
          </ButtonLoading>
        </div>
      </form>
    </Form>
  );
}
