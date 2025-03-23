import { type FC } from 'react';

import { ClipboardBar } from '@/components/common/data-room/clipboard-bar';
import { ClipboardProvider } from '@/components/hoc/clipboard-context';

interface DataRoomLayoutProps {
  children: React.ReactNode;
}

const DataRoomLayout: FC<DataRoomLayoutProps> = ({ children }) => {
  return (
    <ClipboardProvider>
      <div className="flex flex-col flex-1">
        <div className="flex-1 overflow-auto flex">{children}</div>
        <ClipboardBar />
      </div>
    </ClipboardProvider>
  );
};

export default DataRoomLayout;
