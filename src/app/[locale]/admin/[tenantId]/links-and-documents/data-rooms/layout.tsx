import { type FC } from 'react';

import { ClipboardBar } from '@/components/common/data-room/clipboard-bar';

interface DataRoomLayoutProps {
  children: React.ReactNode;
}

const DataRoomLayout: FC<DataRoomLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 overflow-auto flex">{children}</div>
      <ClipboardBar />
    </div>
  );
};

export default DataRoomLayout;
