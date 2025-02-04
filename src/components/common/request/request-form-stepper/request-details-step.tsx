'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { useUploadFile } from '@/hooks/use-upload-file';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/uploader/file-uploader';
import { UploadedFilesCard } from '@/components/uploader/uploaded-files-card';

const mockStatuses = [
  { id: 'status1', name: 'Open' },
  { id: 'status2', name: 'In Progress' },
];

export const requirementComplianceSchema = z.object({
  requestDetails: z.object({
    issueSubject: z.string().optional(),
    description: z.string().max(5000).optional(),
    priority: z.string().optional(),
    comment: z.string().max(255).optional(),
    statusId: z.string(),
    additionalDocuments: z.array(z.instanceof(File)),
  }),
});

export type RequirementComplianceValues = z.infer<typeof requirementComplianceSchema>;

export default function RequestDetailsStep() {
  const { control } = useFormContext<RequirementComplianceValues>();

  const { /* uploadFiles, */ progresses, uploadedFiles, isUploading } = useUploadFile('imageUploader', { defaultUploadedFiles: [] });

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-2 mx-1">
        <FormField
          control={control}
          name="requestDetails.issueSubject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Subject</FormLabel>
              <FormControl>
                <Input id="issueSubject" placeholder="Enter issue subject" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="requestDetails.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea id="description" placeholder="Enter description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="requestDetails.priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="requestDetails.comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Input id="comment" placeholder="Enter comment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="requestDetails.statusId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStatuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="requestDetails.additionalDocuments"
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
    </ScrollArea>
  );
}
