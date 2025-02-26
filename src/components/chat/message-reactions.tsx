'use client';

import { useMemo } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Reaction = {
  id: string;
  userTenant: {
    id: string;
    person: {
      firstName: string;
      lastName: string;
    } | null;
  };
  value: string;
};

type ProcessedReaction = {
  id: string;
  value: string;
  count: number;
  memberIds: string[];
  users: { id: string; name: string }[];
};

type ReactionsProps = {
  currentUserTenantId: string;
  reactions: Reaction[];
  onChange: (reactionId: string) => void;
};

export const Reactions = ({ currentUserTenantId, reactions, onChange }: ReactionsProps) => {
  const processedReactions = useMemo(() => {
    return reactions.reduce<Record<string, ProcessedReaction>>((acc, reaction) => {
      const { value, userTenant } = reaction;

      if (!acc[value]) {
        acc[value] = { id: reaction.id, value, count: 0, memberIds: [], users: [] };
      }

      acc[value].count += 1;
      acc[value].memberIds.push(userTenant.id);
      const name = userTenant.person ? `${userTenant.person.firstName} ${userTenant.person.lastName}` : 'Unknown User';
      acc[value].users.push({ id: userTenant.id, name });

      return acc;
    }, {});
  }, [reactions]);

  const reactionsArray = useMemo(() => Object.values(processedReactions), [processedReactions]);

  const totalReactions = reactionsArray.reduce((sum, r) => sum + r.count, 0);

  if (reactionsArray.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex h-6 items-center gap-x-1 rounded-full border px-2 border-muted bg-muted/50">
          {reactionsArray.map((reaction) => (
            <span key={reaction.value}>{reaction.value}</span>
          ))}
          <span className="text-xs font-semibold ml-1">{totalReactions}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Tabs defaultValue="all">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All <span className="ml-1 text-xs">{totalReactions}</span>
            </TabsTrigger>
            {reactionsArray.map((reaction) => (
              <TabsTrigger key={reaction.value} value={reaction.value} className="flex-1">
                {reaction.value}
                <span className="ml-1 text-xs">{reaction.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="all" className="p-2">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {reactions.map((reaction) => (
                <UserReactionItem
                  key={reaction.id}
                  reactionId={reaction.id}
                  currentUserTenantId={currentUserTenantId}
                  onChange={onChange}
                  reaction={reaction.value}
                  user={{
                    id: reaction.userTenant.id,
                    name: reaction.userTenant.person ? `${reaction.userTenant.person.firstName} ${reaction.userTenant.person.lastName}` : 'Unknown User',
                  }}
                />
              ))}
            </div>
          </TabsContent>
          {reactionsArray.map((reaction) => (
            <TabsContent key={reaction.value} value={reaction.value} className="p-2">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {reaction.users.map((user) => (
                  <UserReactionItem reactionId={reaction.id} currentUserTenantId={currentUserTenantId} onChange={onChange} key={user.id} reaction={reaction.value} user={user} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

const UserReactionItem = ({
  onChange,
  user,
  reaction,
  reactionId,
  currentUserTenantId,
}: {
  reaction: string;
  reactionId: string;
  currentUserTenantId: string;
  onChange: (reactionId: string) => void;
  user: { id: string; name: string };
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  return (
    <Button variant="ghost" className="w-full justify-between px-2 py-1 h-auto text-left" onClick={() => onChange(reactionId)}>
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">{user.id === currentUserTenantId ? 'You' : user.name}</span>
          {user.id === currentUserTenantId && <span className="text-xs text-muted-foreground">Tap to remove</span>}
        </div>
      </div>
      <span>{reaction}</span>
    </Button>
  );
};
