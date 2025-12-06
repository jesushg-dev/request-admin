'use client';

import * as React from 'react';
import Image from 'next/image';
import { FileText, Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Dropzone, { type DropzoneProps, type FileRejection } from 'react-dropzone';
import { toast } from 'sonner';

import { cn, formatBytes } from '@/lib/utils';
import { useControllableState } from '@/hooks/use-controllable-state';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Value of the uploader.
   * @type File[]
   * @default undefined
   * @example value={files}
   */
  value?: File[];

  /**
   * Function to be called when the value changes.
   * @type (files: File[]) => void
   * @default undefined
   * @example onValueChange={(files) => setFiles(files)}
   */
  onValueChange?: (files: File[]) => void;

  /**
   * Function to be called when files are uploaded.
   * @type (files: File[]) => Promise<void>
   * @default undefined
   * @example onUpload={(files) => uploadFiles(files)}
   */
  onUpload?: (files: File[]) => Promise<void>;

  /**
   * Progress of the uploaded files.
   * @type Record<string, number> | undefined
   * @default undefined
   * @example progresses={{ "file1.png": 50 }}
   */
  progresses?: Record<string, number>;

  /**
   * Accepted file types for the uploader.
   * @type { [key: string]: string[]} | undefined
   * @default undefined (accepts any file type)
   * @example accept={{ "image/*": [] }}
   */
  accept?: DropzoneProps['accept'];

  /**
   * Maximum file size for the uploader.
   * @type number | undefined
   * @default 1024 * 1024 * 8 // 8MB
   * @example maxSize={1024 * 1024 * 8} // 8MB
   */
  maxSize?: DropzoneProps['maxSize'];

  /**
   * Maximum number of files for the uploader.
   * @type number | undefined
   * @default 4
   * @example maxFileCount={4}
   */
  maxFileCount?: DropzoneProps['maxFiles'];

  /**
   * Whether the uploader should accept multiple files.
   * @type boolean
   * @default true
   * @example multiple
   */
  multiple?: boolean;

  /**
   * Whether the uploader is disabled.
   * @type boolean
   * @default false
   * @example disabled
   */
  disabled?: boolean;

  /**
   * Show the uploader in a horizontal layout.
   * @type boolean
   * @default false
   * @example horizontal
   */
  horizontal?: boolean;
}

export function FileUploader(props: FileUploaderProps) {
  const t = useTranslations('component.fileUploader');

  const {
    value: valueProp,
    onValueChange,
    onUpload,
    progresses,
    accept = undefined, // Accept any file type
    maxSize = 1024 * 1024 * 8, // 8MB
    maxFileCount = 4,
    multiple = true,
    disabled = false,
    horizontal = false,
    className,
    ...dropzoneProps
  } = props;

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  });

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFileCount === 1 && acceptedFiles.length > 1) {
        toast.error(t('singleFileLimit'));
        return;
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFileCount) {
        toast.error(t('maxFilesExceeded', { maxFileCount }));
        return;
      }

      // If accept is specified, validate file types
      if (accept && acceptedFiles.length > 0) {
        const acceptedMimeTypes = Object.keys(accept).flatMap((mimeType) => {
          if (mimeType.endsWith('/*')) {
            // Handle wildcard MIME types like "image/*"
            return [mimeType];
          }
          return [mimeType, ...(accept[mimeType] || [])];
        });

        const invalidFiles = acceptedFiles.filter((file) => {
          // Check if file type matches any accepted MIME type
          const matches = acceptedMimeTypes.some((acceptedType) => {
            if (acceptedType.endsWith('/*')) {
              const baseType = acceptedType.split('/')[0];
              return file.type.startsWith(`${baseType}/`);
            }
            return file.type === acceptedType;
          });
          return !matches;
        });

        if (invalidFiles.length > 0) {
          invalidFiles.forEach((file) => {
            toast.error(t('fileRejected', { fileName: file.name }));
          });
          // Only add valid files
          acceptedFiles = acceptedFiles.filter((file) => !invalidFiles.includes(file));
          if (acceptedFiles.length === 0) {
            return;
          }
        }
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      const updatedFiles = files ? [...files, ...newFiles] : newFiles;

      setFiles(updatedFiles);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(t('fileRejected', { fileName: file.name }));
        });
      }

      if (onUpload && updatedFiles.length > 0 && updatedFiles.length <= maxFileCount) {
        const count = updatedFiles.length;

        toast.promise(onUpload(updatedFiles), {
          loading: t('uploading', { count }),
          success: () => {
            setFiles([]);
            return t('uploadSuccess', { count });
          },
          error: t('uploadError', { count }),
        });
      }
    },

    [files, maxFileCount, multiple, onUpload, setFiles, t]
  );

  function onRemove(index: number) {
    if (!files) return;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onValueChange?.(newFiles);
  }

  // Revoke preview url when component unmounts
  React.useEffect(() => {
    return () => {
      if (!files) return;
      files.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount;

  return (
    <div className={cn('flex-1 w-full grid gap-2.5 grid-cols-1', horizontal && files?.length && 'md:grid-cols-2', className)}>
      <Dropzone onDrop={onDrop} accept={accept} maxSize={maxSize} maxFiles={maxFileCount} multiple={maxFileCount > 1 || multiple} disabled={isDisabled}>
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              'group relative grid flex-1 min-h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25',
              'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isDragActive && 'border-muted-foreground/50',
              isDisabled && 'pointer-events-none opacity-60',
              className
            )}
            {...dropzoneProps}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <Upload className="size-7 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="font-medium text-muted-foreground">{t('dropHere')}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <Upload className="size-7 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-px">
                  <p className="font-medium text-muted-foreground">{t('dragAndDrop')}</p>
                  <p className="text-sm text-muted-foreground/70">
                    {t('uploadInstructions', {
                      maxSize: formatBytes(maxSize),
                      count: maxFileCount > 1 ? (maxFileCount === Infinity ? 'multiple' : maxFileCount) : 1,
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Dropzone>
      {files?.length ? (
        <ScrollArea className="flex-1 px-3">
          <div className="flex max-h-48 flex-col gap-4">
            {files?.map((file, index) => (
              <FileCard key={index} removeText={t('removeFile')} file={file} onRemove={() => onRemove(index)} progress={progresses?.[file.name]} />
            ))}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  );
}

interface FileCardProps {
  file: File;
  onRemove: () => void;
  progress?: number;
  removeText: string;
}

function FileCard({ file, progress, removeText, onRemove }: FileCardProps) {
  return (
    <div className="relative flex items-center gap-2.5">
      <div className="flex flex-1 gap-2.5">
        {isFileWithPreview(file) ? <FilePreview file={file} /> : null}
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-px">
            <p className="line-clamp-1 text-sm font-medium text-foreground/80">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          {progress ? <Progress value={progress} /> : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon" className="size-7" onClick={onRemove}>
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">{removeText}</span>
        </Button>
      </div>
    </div>
  );
}

function isFileWithPreview(file: File): file is File & { preview: string } {
  return 'preview' in file && typeof file.preview === 'string';
}

interface FilePreviewProps {
  file: File & { preview: string };
}

function FilePreview({ file }: FilePreviewProps) {
  if (file.type.startsWith('image/')) {
    return <Image src={file.preview} alt={file.name} width={48} height={48} loading="lazy" className="aspect-square shrink-0 rounded-md object-cover" />;
  }

  return <FileText className="size-10 text-muted-foreground" aria-hidden="true" />;
}
