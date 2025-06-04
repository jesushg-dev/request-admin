'use client';

import { useTransition } from 'react';
import dynamic from 'next/dynamic';
import { createMessage } from '@/actions/message';
import { useMessages as useAblyMessages } from '@ably/chat/react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { UserTenant } from '@/types/user';
import { ConvertAblyDataToOurMetadata } from '@/lib/ablyChat';
import { generateUuid } from '@/lib/id';
import { EditorValue } from '@/components/chat/editor';

import { Skeleton } from '../ui/skeleton';

const Editor = dynamic(() => import('@/components/chat/editor'), {
  ssr: false,
  loading: () => <Skeleton className="h-16 w-full" />,
});

interface ChatInputProps {
  tenantId: string;
  relatedId: string;
  placeholder?: {
    paragraph?: string;
    imageCaption?: string;
  };
  currentUserTenant: UserTenant;
  variant: 'conversation' | 'channel' | 'thread';
  enableEmail?: boolean;
  enableWhatsApp?: boolean;
}

export const ChatInput = ({ placeholder, relatedId, variant, tenantId, currentUserTenant, enableEmail = false, enableWhatsApp = false }: ChatInputProps) => {
  const t = useTranslations('component.chat.chatInput');
  const [isPending, startTransition] = useTransition();

  const { send: sendAblyMessage } = useAblyMessages();

  const handleSubmit = async (value: EditorValue) => {
    startTransition(async () => {
      try {
        const id = generateUuid();
        const ablyResult = await sendAblyMessage({ text: value.body, metadata: { id: id, ...currentUserTenant } });
        await createMessage({
          id,
          variant,
          ...value,
          tenantId,
          relatedId,
          userTenantId: currentUserTenant.userTenantId,
          imageFile: value.image ?? undefined,
          metadata: ConvertAblyDataToOurMetadata(ablyResult),
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        toast.error(t('error.failedToSend'));
      }
    });
  };

  const defaultPlaceholder = {
    paragraph: t('placeholder.paragraph'),
    imageCaption: t('placeholder.imageCaption'),
  };

  return <Editor variant="create" placeholder={placeholder || defaultPlaceholder} onSubmit={handleSubmit} disabled={isPending} emailEnabled={enableEmail} whatsAppEnabled={enableWhatsApp} />;
};
