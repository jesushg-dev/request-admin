'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useCreateMessage } from '@/services/api/hooks';
import { Prisma } from '@zenstackhq/runtime/models';
import { toast } from 'sonner';

const Editor = dynamic(() => import('@/components/chat/editor'), { ssr: false });

interface ChatInputProps {
  tenantId: string;
  relatedId: string;
  placeholder?: {
    paragraph?: string;
    imageCaption?: string;
  };
  currentUserTenantId: string;
  relatedType: 'conversation' | 'channel' | 'parentMessage';
}

export const ChatInput = ({ placeholder, relatedId, relatedType, tenantId, currentUserTenantId }: ChatInputProps) => {
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const { mutateAsync: createMessage } = useCreateMessage();

  const handleSubmit = async ({ body, image }: { body: string; image: File | null }) => {
    try {
      setIsPending(true);

      const values: Prisma.MessageCreateInput = {
        body,
        tenant: { connect: { id: tenantId } },
        userTenant: { connect: { id: currentUserTenantId } },
        ...getRelatedConnection(relatedType, relatedId),
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
    }
  };

  return <Editor key={editorKey} variant="create" placeholder={placeholder} onSubmit={handleSubmit} disabled={isPending} />;
};

const getRelatedConnection = (relatedType: 'conversation' | 'channel' | 'parentMessage', relatedId: string) => {
  switch (relatedType) {
    case 'conversation':
      return { conversation: { connect: { id: relatedId } } };
    case 'channel':
      return { channel: { connect: { id: relatedId } } };
    case 'parentMessage':
      return { parentMessage: { connect: { id: relatedId } } };
    default:
      throw new Error('Invalid related type');
  }
};
