import { FaChevronDown } from 'react-icons/fa';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  memberName?: string;
  memberImage?: string;
  onClick?: () => void;
}

export const Header = ({ memberImage, memberName = 'Member', onClick }: HeaderProps) => {
  const avatarFallback = memberName.charAt(0).toUpperCase();

  return (
    <div className="flex h-[49px] items-center overflow-hidden border-b border-gray-500/80 bg-white px-4">
      <Button variant="ghost" size="sm" className="w-auto overflow-hidden px-2 text-lg font-semibold" onClick={onClick}>
        <Avatar className="mr-2 size-6">
          <AvatarImage src={memberImage} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <span className="truncate">{memberName}</span>
        <FaChevronDown className="ml-2 size-2.5" />
      </Button>
    </div>
  );
};
