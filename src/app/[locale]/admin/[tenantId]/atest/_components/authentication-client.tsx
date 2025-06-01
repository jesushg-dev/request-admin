'use client';

import { useState } from 'react';
import { useAbly, useConnectionStateListener } from 'ably/react';
import { Zap, ZapOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Hint } from '@/components/hint';

export default function Authentication() {
  const ably = useAbly();

  const [connectionState, setConnectionState] = useState('unknown');

  useConnectionStateListener((stateChange) => {
    setConnectionState(stateChange.current);
  });

  const connectionToggle = () => {
    if (connectionState === 'connected') {
      ably.connection.close();
    } else if (connectionState === 'closed') {
      ably.connection.connect();
    }
  };

  return (
    <>
      <div className="flex flex-col justify-start items-start gap-4 w-[752px] h-[124px]">
        <div className="flex flex-row justify-start items-start gap-4 pt-6 pr-6 pb-6 pl-6 rounded-lg border-slate-100 border-t border-b border-l border-r border-solid border h-[68px] bg-white min-w-[752px]">
          <div className="font-jetbrains-mono text-sm min-w-[227px] whitespace-nowrap text-rose-400 text-opacity-100 leading-normal font-medium">
            connection status
            <span className="text-zinc-200 text-opacity-100">&nbsp;</span>
            =&nbsp;
            <span className="text-violet-400 text-opacity-100">{connectionState}</span>
          </div>
        </div>
        <Hint label={connectionState === 'connected' ? 'Disconnect' : 'Connect'}>
          <Button type="button" variant="ghost" size="icon" onClick={connectionToggle}>
            {connectionState === 'connected' ? <Zap className="w-4 h-4 text-yellow-500" /> : <ZapOff className="w-4 h-4 text-red-500" />}
          </Button>
        </Hint>
      </div>
    </>
  );
}
