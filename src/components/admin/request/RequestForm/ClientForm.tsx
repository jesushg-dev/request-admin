import React, { useState, useEffect } from 'react';
import type { FC } from 'react';

import TabView, { Tab } from '@/components/TabView';

import { MdPerson, MdRestore } from 'react-icons/md';

import ClientDetailForm from '@/components/admin/client/ClientDetailForm';

import rswitch from '@/services/lib/rswitch';
import ClientSelector from '@/components/admin/client/ClientSelector';
import type { ClientType } from '@/utils/types';
import type { CreateClientInputs } from '@/connections/client';

type ClientInputType = {
  newClientData: CreateClientInputs | null;
  clientData: ClientType | null;
};

interface IClientFormProps {
  loading: boolean;
  clients: ClientType[];
  defaultValues?: ClientInputType | null;
  onChange: (data: ClientInputType) => void;
  goBack: () => void;
}

const ClientForm: FC<IClientFormProps> = ({ onChange, goBack, clients, defaultValues, loading }) => {
  const [step, setStep] = useState(0);

  const onClientDetailSubmit = (data: CreateClientInputs) => {
    onChange({ newClientData: data, clientData: null });
  };

  const onClientSelect = (data: ClientType) => {
    onChange({ newClientData: null, clientData: data });
  };

  useEffect(() => {
    if (defaultValues) {
      setStep(defaultValues.newClientData ? 1 : 0);
    }
  }, [defaultValues]);

  return (
    <div>
      <TabView value={step} onChange={setStep} clickable aria-label="Client Management" className="shadow-1 mb-0 items-center justify-center">
        <Tab index={0} label="Existing Client" Icon={MdRestore} aria-label="Tab for selecting an existing client" />
        <Tab index={1} label="New Client" Icon={MdPerson} aria-label="Tab for adding a new client" />
      </TabView>
      {rswitch(step, {
        0: <ClientSelector loading={loading} clients={clients} defaultValue={defaultValues?.clientData} onChange={onClientSelect} goBack={goBack} />,
        1: <ClientDetailForm defaultValues={defaultValues?.newClientData} onSubmit={onClientDetailSubmit} goBack={goBack} />,
      })}
    </div>
  );
};

export default ClientForm;
