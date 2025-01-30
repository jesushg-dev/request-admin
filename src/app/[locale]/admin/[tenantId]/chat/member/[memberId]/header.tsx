import { ChevronDown } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  userName?: string;
  userImage?: string;
  onClick?: () => void;
}

export const Header = ({ userImage, userName = 'User', onClick }: HeaderProps) => {
  const avatarFallback = userName.charAt(0).toUpperCase();

  return (
    <div className="flex h-[49px] items-center overflow-hidden border-b border-gray-500/80 bg-white px-4">
      <Button variant="ghost" size="sm" className="w-auto overflow-hidden px-2 text-lg font-semibold" onClick={onClick}>
        <Avatar className="mr-2 size-6">
          <AvatarImage src={userImage} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <span className="truncate">{userName}</span>
        <ChevronDown className="ml-2 size-2.5" />
      </Button>
    </div>
  );
};
