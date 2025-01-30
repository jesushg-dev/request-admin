'use client';

import { ExitIcon } from '@radix-ui/react-icons';
import { UserIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogoutButton } from '@/components/auth/logout-button';

export const UserButton = () => {
  const session = useSession();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={session.data?.user?.image || ''} style={{ objectFit: 'contain', objectPosition: 'center' }} />
          <AvatarFallback className="bg-sky-500">
            <UserIcon className="text-white" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <LogoutButton>
          <DropdownMenuItem>
            <ExitIcon className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
