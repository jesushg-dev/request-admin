import { memo, useState } from 'react';
import { usePresenceListener, useTyping } from '@ably/chat/react';
import { Dot } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Interface for presence data
interface PresenceData {
  name?: string;
  status?: string;
  image?: string;
}

// Props for TypingIndicator, with optional currentClientId
interface TypingIndicatorProps {
  currentClientId?: string;
}

export const TypingIndicator = memo(({ currentClientId }: TypingIndicatorProps) => {
  // Get presence data from Ably
  const { presenceData } = usePresenceListener();
  // State for currently typing user IDs
  const [currentlyTyping, setCurrentlyTyping] = useState<string[]>([]);

  // Listen for typing events
  useTyping({
    listener: (typingEvent) => {
      setCurrentlyTyping(Array.from(typingEvent.currentlyTyping));
    },
  });

  if (currentlyTyping.length === 0) return null;

  // Map clientId to presence data for quick lookup
  const presenceMap = Object.fromEntries(presenceData.map((user) => [user.clientId, user.data as PresenceData]));

  // Utility to format names as "A, B and C"
  const formatNames = (users: { name?: string; clientId: string }[]) => {
    const names = users.map((u) => u.name || u.clientId);
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} y ${names[1]}`;
    return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
  };

  // Build the list of typing users with their presence data, filtering out the current user if provided
  const typingUsers = currentlyTyping
    .filter((id) => !currentClientId || id !== currentClientId)
    .map((id) => ({
      clientId: id,
      ...presenceMap[id],
    }));

  if (typingUsers.length === 0) return null;

  return (
    <div className="hover:border-muted border border-transparent group relative flex flex-col gap-2 py-6 px-5">
      <div className="flex items-start gap-2">
        {/* Avatars for each typing user */}
        <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
          {typingUsers.map((user) => (
            <Avatar key={user.clientId} data-slot="avatar">
              {user.image ? <AvatarImage src={user.image} alt={user.name || user.clientId} /> : <AvatarFallback>{(user.name || user.clientId).slice(0, 1).toUpperCase()}</AvatarFallback>}
            </Avatar>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {/* Badge with typing user names */}
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="font-semibold text-primary text-xs px-2 py-0.5 bg-transparent border-none">
              {formatNames(typingUsers)}
            </Badge>
          </div>
          {/* Animated typing dots */}
          <div className="flex -space-x-1 ml-2">
            <Dot className="h-4 w-4 animate-typing-dot-bounce text-primary/60" />
            <Dot className="h-4 w-4 animate-typing-dot-bounce text-primary/60 [animation-delay:120ms]" />
            <Dot className="h-4 w-4 animate-typing-dot-bounce text-primary/60 [animation-delay:240ms]" />
          </div>
        </div>
      </div>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';
