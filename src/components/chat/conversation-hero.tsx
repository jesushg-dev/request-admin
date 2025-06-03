import { useTranslations } from 'next-intl';

import { usePanel } from '@/hooks/use-panel';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ConversationHeroProps {
  name?: string | null;
  image?: string | null;
  userId: string;
}

export const ConversationHero = ({ name, image, userId }: ConversationHeroProps) => {
  const t = useTranslations('component.chat.conversationHero');
  const avatarImageFallback = (name || t('defaultName')).charAt(0).toUpperCase();
  const { onOpenProfile } = usePanel();

  return (
    <div className="mx-5 mt-[88px] mb-4">
      <div className="mb-2 flex items-center gap-x-1">
        <Avatar onClick={() => onOpenProfile(userId)} className="mr-2 size-14 hover:cursor-pointer">
          <AvatarImage src={image || undefined} alt={name || t('defaultName')} />
          <AvatarFallback className="text-lg">{avatarImageFallback}</AvatarFallback>
        </Avatar>
        <p className="text-2xl font-bold">{name || t('defaultName')}</p>
      </div>
      <p className="mb-4 font-normal text-slate-800">
        {t('description')} <strong>{name || t('defaultName')}</strong>
      </p>
    </div>
  );
};
