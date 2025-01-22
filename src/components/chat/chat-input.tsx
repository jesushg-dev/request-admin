import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useCreateMessage } from '@/services/api/hooks';
import { Prisma } from '@zenstackhq/runtime/models';
import Quill from 'quill';
import { toast } from 'sonner';

const Editor = dynamic(() => import('@/components/editor'), { ssr: false });

interface ChatInputProps {
  tenantId: string;
  relatedId: string;
  relatedType: 'conversation' | 'channel';
  placeholder: string;
  currentUserId: string;
}

export const ChatInput = ({ placeholder, relatedId, relatedType, tenantId, currentUserId }: ChatInputProps) => {
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const editorRef = useRef<Quill | null>(null);

  const { mutateAsync: createMessage } = useCreateMessage();

  const handleSubmit = async ({ body, image }: { body: string; image: File | null }) => {
    try {
      setIsPending(true);
      editorRef?.current?.enable(false);

      const values: Prisma.MessageCreateInput = {
        body,
        tenant: { connect: { id: tenantId } },
        userTenant: { connect: { userId_tenantId: { tenantId, userId: currentUserId } } },
        ...(relatedType === 'conversation' ? { conversation: { connect: { id: relatedId } } } : { channel: { connect: { id: relatedId } } }),
      };

      if (image) {
        // TODO: Upload image to storage and get the storageId here
        // values.image = storageId;
      }

      await createMessage({ data: values });

      setEditorKey((prevKey) => prevKey + 1);
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsPending(false);
      editorRef?.current?.enable(true);
    }
  };

  return (
    <div className="w-full px-5">
      <Editor key={editorKey} variant="create" placeholder={placeholder} onSubmit={handleSubmit} disabled={isPending} innerRef={editorRef} />
    </div>
  );
};
