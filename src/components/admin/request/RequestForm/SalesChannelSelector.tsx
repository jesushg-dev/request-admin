import React, { useEffect, useState, type FC } from 'react';

import BackAndContinue from '@/components/common/back-and-continue';

import LoadingComponent from './LoadingComponent';
import HandleListState from '@/components/common/handle-data-state';
import { triggerError } from '@/utils/tools/message';
import { MdShoppingCart } from 'react-icons/md';
import type { RouterOutputs } from '@/server/server';

type SalesChannel = RouterOutputs['salesChannel']['getAll'];

interface ISaleChannelSelectorProps {
  loading?: boolean;
  defaultValue?: string;
  channels: SalesChannel;
  onChange: (selectedChannelId: string) => void;
  goBack: () => void;
}

const SalesChannelSelector: FC<ISaleChannelSelectorProps> = ({ channels, loading, onChange, goBack, defaultValue }) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>();

  useEffect(() => {
    if (defaultValue) setSelectedChannelId(defaultValue);
  }, [defaultValue]);

  const onSubmit = async () => {
    if (selectedChannelId) {
      onChange(selectedChannelId);
    } else {
      await triggerError('Please select a sales channel');
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <h1 className="text-2xl font-semibold">Select a Sales Channel</h1>

      <HandleListState isLoading={loading} isError={false} isEmpty={channels.length === 0} skeleton={<LoadingComponent />}>
        <div className="item grid flex-1 grid-cols-2 gap-5">
          {channels.map((channel) => (
            <label key={channel.salesChannelId} className="w-full cursor-pointer">
              <input
                type="radio"
                className="peer sr-only"
                name="salesChannel"
                value={channel.salesChannelId}
                onChange={() => setSelectedChannelId(channel.salesChannelId)}
                checked={selectedChannelId === channel.salesChannelId}
              />
              <div className="flex h-full w-full rounded-md bg-white p-5 text-gray-600 ring-2 ring-blue-100 transition-all hover:shadow peer-checked:text-black peer-checked:ring-blue-600 peer-checked:ring-offset-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <MdShoppingCart className="text-2xl text-blue-500" />
                    <p className="text-sm font-semibold uppercase text-gray-500">{channel.name}</p>
                  </div>
                  <p className="text-sm">{channel.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </HandleListState>

      {channels.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-400">No sales channels available</p>
        </div>
      )}

      <BackAndContinue goBack={goBack} type="submit" goContinue={onSubmit} />
    </div>
  );
};

export default SalesChannelSelector;
