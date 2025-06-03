import { type FC } from 'react';
import { useChatConnection, usePresence, usePresenceListener } from '@ably/chat/react';
import { Clock, Users, Wifi, WifiOff } from 'lucide-react';
import { useFormatter, useNow } from 'next-intl';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface PresenceData {
  name?: string;
  status?: string;
  image?: string;
}

function RelativeTime({ date }: { date: number }) {
  const now = useNow();
  const format = useFormatter();
  return <>{format.relativeTime(date, now)}</>;
}

interface ChatHeaderProps {
  name: string;
}

export const ChatHeader: FC<ChatHeaderProps> = ({ name }) => {
  usePresence({
    enterWithData: { name, status: 'En línea' },
    leaveWithData: { name, status: 'Desconectado' },
  });
  const { currentStatus } = useChatConnection();
  const { presenceData } = usePresenceListener();

  const activeUsers = presenceData
    .filter((user) => user.action !== 'leave')
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((user) => ({
      ...user,
      data: user.data as PresenceData,
    }));

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Online Users */}
      {activeUsers.length > 0 && (
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Badge variant="secondary" title="Usuarios conectados" className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium cursor-pointer" tabIndex={0}>
                <Users className="h-3.5 w-3.5" />
                {activeUsers
                  .slice(0, 3)
                  .map((user) => user.data?.name || user.clientId)
                  .join(', ')}
                {activeUsers.length > 3 && <span className="ml-1 text-muted-foreground">+{activeUsers.length - 3} más</span>}
              </Badge>
            </SheetTrigger>
            <SheetContent side="right" className="max-w-xs sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Usuarios conectados</SheetTitle>
              </SheetHeader>
              <div className="space-y-2 mt-2">
                {activeUsers.map((user) => (
                  <div key={user.clientId} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{user.data?.name || user.clientId}</span>
                      {user.data?.status && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                          {user.data.status}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <RelativeTime date={user.updatedAt} />
                    </div>
                  </div>
                ))}
                {activeUsers.length === 0 && <div className="text-xs text-muted-foreground/70">No hay usuarios conectados.</div>}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium',
            currentStatus === 'connected' ? 'border-green-500/20 bg-green-500/10 text-green-600' : 'border-red-500/20 bg-red-500/10 text-red-600'
          )}>
          {currentStatus === 'connected' ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {currentStatus === 'connected' ? 'En línea' : 'Desconectado'}
        </Badge>
      </div>
    </div>
  );
};
