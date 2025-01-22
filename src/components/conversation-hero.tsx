import { useMemberId } from '@/hooks/use-member-id';
import { usePanel } from '@/hooks/use-panel';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface ConversationHeroProps {
  name?: string;
  image?: string;
}

export const ConversationHero = ({ name = 'Member', image }: ConversationHeroProps) => {
  const avatarImageFallback = name.charAt(0).toUpperCase();
  const memberId = useMemberId();
  const { onOpenProfile } = usePanel();

  return (
    <div className="mx-5 mb-4 mt-[88px]">
      <div className="mb-2 flex items-center gap-x-1">
        <Avatar onClick={() => onOpenProfile(memberId)} className="mr-2 size-14 hover:cursor-pointer">
          <AvatarImage src={image} />
          <AvatarFallback className="text-lg">{avatarImageFallback}</AvatarFallback>
        </Avatar>
        <p className="text-2xl font-bold">{name}</p>
      </div>
      <p className="mb-4 font-normal text-slate-800">
        This conversation is just between you and <strong>{name}</strong>
      </p>
    </div>
  );
};
