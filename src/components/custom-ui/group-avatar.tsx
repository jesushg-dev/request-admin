'use client';

import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export interface User {
  id: string;
  name: string;
  fullName: string;
  avatar?: string; // Hago el avatar opcional
  roles: string[];
}

export interface GroupAvatarProps {
  users: User[];
  size?: 'sm' | 'md' | 'lg';
}

export interface UsersDialogProps {
  users: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Función auxiliar para obtener las iniciales de un nombre
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const UsersDialog = ({ users, open, onOpenChange }: UsersDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Usuarios del grupo</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 py-2">
            {users.map((user, index) => (
              <div key={user.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">{user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>}</Avatar>
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-lg font-medium">{user.fullName}</h3>
                      <p className="text-sm text-muted-foreground">@{user.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="secondary">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export function GroupAvatar({ users, size = 'md' }: GroupAvatarProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const mainUser = users[0];
  const remainingCount = users.length - 1;

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const counterSizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2 cursor-pointer" onClick={() => setDialogOpen(true)}>
        {mainUser && (
          <Avatar className={`${sizeClasses[size]} border-2 border-background dark:border-gray-800 z-10 ring-2 ring-white dark:ring-gray-800`}>
            {mainUser.avatar ? <AvatarImage src={mainUser.avatar} alt={mainUser.name} /> : <AvatarFallback>{getInitials(mainUser.fullName)}</AvatarFallback>}
          </Avatar>
        )}

        {remainingCount > 0 && (
          <div
            className={`${counterSizeClasses[size]} flex items-center justify-center rounded-full bg-muted text-muted-foreground border-2 border-background dark:border-gray-800 font-medium ring-2 ring-white dark:ring-gray-800`}>
            +{remainingCount}
          </div>
        )}
      </div>

      <UsersDialog users={users} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
