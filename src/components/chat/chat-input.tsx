'use client';

import { useTransition } from 'react';
import dynamic from 'next/dynamic';
import { createMessage } from '@/actions/message';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

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
  currentUserTenantId: string;
  variant: 'conversation' | 'channel' | 'thread';
  enableEmail?: boolean;
  enableWhatsApp?: boolean;
}

export const ChatInput = ({ placeholder, relatedId, variant, tenantId, currentUserTenantId, enableEmail = false, enableWhatsApp = false }: ChatInputProps) => {
  const t = useTranslations('component.chat.chatInput');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (value: { body: string; image: File | null; emailEnabled?: boolean; whatsAppEnabled?: boolean }) => {
    startTransition(async () => {
      try {
        await createMessage({
          body: value.body,
          tenantId,
          userTenantId: currentUserTenantId,
          variant,
          relatedId,
          imageFile: value.image ?? undefined,
          emailEnabled: value.emailEnabled,
          whatsAppEnabled: value.whatsAppEnabled,
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
